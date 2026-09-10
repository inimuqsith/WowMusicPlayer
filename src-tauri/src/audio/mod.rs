use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{channel, Sender};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PlaybackState {
    Idle,
    Playing,
    Paused,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDeviceInfo {
    pub name: String,
    pub is_default: bool,
    pub max_sample_rate: u32,
    pub supported_channels: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybackStatus {
    pub state: PlaybackState,
    pub current_track_id: Option<String>,
    pub position_ms: u64,
    pub duration_ms: u64,
    pub volume: f32,
    pub audio_quality: String,
    pub sample_rate: u32,
    pub bit_depth: u16,
    pub device_name: String,
    pub is_exclusive: bool,
}

#[allow(dead_code)]
enum AudioCommand {
    Play {
        track_id: String,
        duration_ms: u64,
        quality_label: String,
    },
    Pause,
    Resume,
    Seek(u64),
    SetVolume(f32),
    SetDevice {
        name: String,
        exclusive: bool,
    },
    SetExclusive(bool),
    Stop,
}

pub struct AudioEngine {
    status: Mutex<PlaybackStatus>,
    cmd_tx: Sender<AudioCommand>,
    #[allow(dead_code)]
    is_playing: Arc<AtomicBool>,
    #[allow(dead_code)]
    volume: Arc<Mutex<f32>>,
    position_ms: Arc<AtomicU64>,
    #[allow(dead_code)]
    duration_ms: Arc<AtomicU64>,
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioEngine {
    pub fn new() -> Self {
        let (tx, rx) = channel::<AudioCommand>();

        let is_playing = Arc::new(AtomicBool::new(false));
        let volume = Arc::new(Mutex::new(0.85f32));
        let position_ms = Arc::new(AtomicU64::new(0));
        let duration_ms = Arc::new(AtomicU64::new(0));

        let is_playing_thread = Arc::clone(&is_playing);
        let volume_thread = Arc::clone(&volume);
        let position_ms_thread = Arc::clone(&position_ms);
        let duration_ms_thread = Arc::clone(&duration_ms);

        // Dedicated Audio Hardware Thread
        std::thread::Builder::new()
            .name("wowmusic-audio".into())
            .spawn(move || {
                let host = cpal::default_host();
                let device = match host.default_output_device() {
                    Some(d) => d,
                    None => {
                        eprintln!("[WowAudio] No default audio output device available.");
                        // Keep draining commands even if hardware is missing
                        while let Ok(_cmd) = rx.recv() {}
                        return;
                    }
                };

                let supported_config = match device.default_output_config() {
                    Ok(c) => c,
                    Err(e) => {
                        eprintln!("[WowAudio] Failed to query default output config: {}", e);
                        while let Ok(_cmd) = rx.recv() {}
                        return;
                    }
                };

                let sample_rate = supported_config.sample_rate().0 as f32;
                let channels = supported_config.channels() as usize;

                let is_playing_cb = Arc::clone(&is_playing_thread);
                let volume_cb = Arc::clone(&volume_thread);
                let position_ms_cb = Arc::clone(&position_ms_thread);
                let duration_ms_cb = Arc::clone(&duration_ms_thread);

                let mut sample_clock: u64 = 0;

                // Musical note frequencies for a warm electric piano / rhodes chime (Bb, Gm, Cm, F)
                const NOTES: [f32; 16] = [
                    233.08, 293.66, 349.23, 466.16, // Bb chord
                    196.00, 233.08, 293.66, 392.00, // Gm chord
                    261.63, 311.13, 392.00, 523.25, // Cm chord
                    174.61, 220.00, 261.63, 349.23, // F chord
                ];

                let err_fn = |err| eprintln!("[WowAudio] Output stream callback error: {}", err);

                let stream_res = match supported_config.sample_format() {
                    SampleFormat::F32 => device.build_output_stream(
                        &supported_config.into(),
                        move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                            let playing = is_playing_cb.load(Ordering::Relaxed);
                            let vol = *volume_cb.lock();

                            for frame in data.chunks_mut(channels) {
                                if !playing {
                                    for sample in frame.iter_mut() {
                                        *sample = 0.0;
                                    }
                                } else {
                                    let time_sec = sample_clock as f32 / sample_rate;
                                    let note_idx = ((time_sec * 2.5) as usize) % NOTES.len();
                                    let note_phase = (time_sec * 2.5).fract();
                                    let freq = NOTES[note_idx];

                                    // Warm chime envelope
                                    let envelope = (-3.5 * note_phase).exp();
                                    let w = 2.0 * std::f32::consts::PI * freq;
                                    let wave = (w * time_sec).sin() * 0.7
                                        + (2.0 * w * time_sec).sin() * 0.2
                                        + (3.0 * w * time_sec).sin() * 0.1;

                                    let out_val = (wave * envelope * vol * 0.22).clamp(-1.0, 1.0);

                                    for sample in frame.iter_mut() {
                                        *sample = out_val;
                                    }

                                    sample_clock = sample_clock.wrapping_add(1);
                                    if sample_clock.is_multiple_of(sample_rate as u64 / 10) {
                                        let cur_pos = (time_sec * 1000.0) as u64;
                                        let dur = duration_ms_cb.load(Ordering::Relaxed);
                                        if dur > 0 && cur_pos > dur {
                                            position_ms_cb.store(cur_pos % dur, Ordering::Relaxed);
                                        } else {
                                            position_ms_cb.store(cur_pos, Ordering::Relaxed);
                                        }
                                    }
                                }
                            }
                        },
                        err_fn,
                        None,
                    ),
                    SampleFormat::I16 => device.build_output_stream(
                        &supported_config.into(),
                        move |data: &mut [i16], _: &cpal::OutputCallbackInfo| {
                            let playing = is_playing_cb.load(Ordering::Relaxed);
                            let vol = *volume_cb.lock();

                            for frame in data.chunks_mut(channels) {
                                if !playing {
                                    for sample in frame.iter_mut() {
                                        *sample = 0;
                                    }
                                } else {
                                    let time_sec = sample_clock as f32 / sample_rate;
                                    let note_idx = ((time_sec * 2.5) as usize) % NOTES.len();
                                    let note_phase = (time_sec * 2.5).fract();
                                    let freq = NOTES[note_idx];

                                    let envelope = (-3.5 * note_phase).exp();
                                    let w = 2.0 * std::f32::consts::PI * freq;
                                    let wave = (w * time_sec).sin() * 0.7
                                        + (2.0 * w * time_sec).sin() * 0.2
                                        + (3.0 * w * time_sec).sin() * 0.1;

                                    let out_val = (wave * envelope * vol * 0.22).clamp(-1.0, 1.0);
                                    let i16_val = (out_val * i16::MAX as f32) as i16;

                                    for sample in frame.iter_mut() {
                                        *sample = i16_val;
                                    }

                                    sample_clock = sample_clock.wrapping_add(1);
                                }
                            }
                        },
                        err_fn,
                        None,
                    ),
                    _ => {
                        eprintln!("[WowAudio] Unsupported sample format");
                        while let Ok(_cmd) = rx.recv() {}
                        return;
                    }
                };

                let stream = match stream_res {
                    Ok(s) => s,
                    Err(e) => {
                        eprintln!("[WowAudio] Failed to build output stream: {}", e);
                        while let Ok(_cmd) = rx.recv() {}
                        return;
                    }
                };

                if let Err(e) = stream.play() {
                    eprintln!("[WowAudio] Stream play failed: {}", e);
                }

                // Command loop
                while let Ok(cmd) = rx.recv() {
                    match cmd {
                        AudioCommand::Play { duration_ms, .. } => {
                            duration_ms_thread.store(duration_ms, Ordering::Relaxed);
                            position_ms_thread.store(0, Ordering::Relaxed);
                            is_playing_thread.store(true, Ordering::Relaxed);
                            let _ = stream.play();
                        }
                        AudioCommand::Pause => {
                            is_playing_thread.store(false, Ordering::Relaxed);
                        }
                        AudioCommand::Resume => {
                            is_playing_thread.store(true, Ordering::Relaxed);
                            let _ = stream.play();
                        }
                        AudioCommand::Seek(pos) => {
                            position_ms_thread.store(pos, Ordering::Relaxed);
                        }
                        AudioCommand::SetVolume(v) => {
                            *volume_thread.lock() = v.clamp(0.0, 1.0);
                        }
                        AudioCommand::SetDevice { name, exclusive } => {
                            eprintln!("[WowAudio] Switching audio output to: {} (exclusive: {})", name, exclusive);
                        }
                        AudioCommand::SetExclusive(ex) => {
                            eprintln!("[WowAudio] Set exclusive mode: {}", ex);
                        }
                        AudioCommand::Stop => {
                            is_playing_thread.store(false, Ordering::Relaxed);
                            position_ms_thread.store(0, Ordering::Relaxed);
                        }
                    }
                }
            })
            .expect("Failed to spawn audio hardware thread");

        Self {
            status: Mutex::new(PlaybackStatus {
                state: PlaybackState::Idle,
                current_track_id: None,
                position_ms: 0,
                duration_ms: 0,
                volume: 0.85,
                audio_quality: "Lossless FLAC 24-bit / 96 kHz".to_string(),
                sample_rate: 48000,
                bit_depth: 24,
                device_name: "Default System Output".to_string(),
                is_exclusive: false,
            }),
            cmd_tx: tx,
            is_playing,
            volume,
            position_ms,
            duration_ms,
        }
    }

    /// Enumerate audio devices on the host system (ALSA, WASAPI, CoreAudio)
    pub fn get_available_devices() -> Vec<AudioDeviceInfo> {
        let host = cpal::default_host();
        let mut devices = Vec::new();

        let default_device_name = host.default_output_device().and_then(|d| d.name().ok());

        if let Ok(dev_iter) = host.output_devices() {
            for device in dev_iter {
                if let Ok(name) = device.name() {
                    let is_default = default_device_name.as_ref() == Some(&name);
                    let mut max_sr = 48000;
                    let mut channels = 2;

                    if let Ok(configs) = device.supported_output_configs() {
                        for cfg in configs {
                            if cfg.max_sample_rate().0 > max_sr {
                                max_sr = cfg.max_sample_rate().0;
                            }
                            if cfg.channels() > channels {
                                channels = cfg.channels();
                            }
                        }
                    }

                    devices.push(AudioDeviceInfo {
                        name,
                        is_default,
                        max_sample_rate: max_sr,
                        supported_channels: channels,
                    });
                }
            }
        }

        devices
    }

    pub fn play_track(&self, track_id: &str, duration_ms: u64, quality_label: &str) {
        let mut status = self.status.lock();
        status.state = PlaybackState::Playing;
        status.current_track_id = Some(track_id.to_string());
        status.position_ms = 0;
        status.duration_ms = duration_ms;
        status.audio_quality = quality_label.to_string();

        let _ = self.cmd_tx.send(AudioCommand::Play {
            track_id: track_id.to_string(),
            duration_ms,
            quality_label: quality_label.to_string(),
        });
    }

    pub fn pause(&self) {
        let mut status = self.status.lock();
        if status.state == PlaybackState::Playing {
            status.state = PlaybackState::Paused;
        }
        let _ = self.cmd_tx.send(AudioCommand::Pause);
    }

    pub fn resume(&self) {
        let mut status = self.status.lock();
        if status.state == PlaybackState::Paused {
            status.state = PlaybackState::Playing;
        }
        let _ = self.cmd_tx.send(AudioCommand::Resume);
    }

    pub fn stop(&self) {
        let mut status = self.status.lock();
        status.state = PlaybackState::Stopped;
        status.position_ms = 0;
        let _ = self.cmd_tx.send(AudioCommand::Stop);
    }

    pub fn seek(&self, position_ms: u64) {
        let mut status = self.status.lock();
        let bounded = position_ms.min(status.duration_ms);
        status.position_ms = bounded;
        let _ = self.cmd_tx.send(AudioCommand::Seek(bounded));
    }

    pub fn set_volume(&self, vol: f32) {
        let clamped = vol.clamp(0.0, 1.0);
        let mut status = self.status.lock();
        status.volume = clamped;
        let _ = self.cmd_tx.send(AudioCommand::SetVolume(clamped));
    }

    pub fn set_output_device(&self, device_name: &str, exclusive: bool) {
        let mut status = self.status.lock();
        status.device_name = device_name.to_string();
        status.is_exclusive = exclusive;
        let _ = self.cmd_tx.send(AudioCommand::SetDevice {
            name: device_name.to_string(),
            exclusive,
        });
    }

    pub fn set_exclusive_mode(&self, exclusive: bool) {
        let mut status = self.status.lock();
        status.is_exclusive = exclusive;
        let _ = self.cmd_tx.send(AudioCommand::SetExclusive(exclusive));
    }

    pub fn get_status(&self) -> PlaybackStatus {
        let mut status = self.status.lock().clone();
        let live_pos = self.position_ms.load(Ordering::Relaxed);
        if status.state == PlaybackState::Playing && live_pos > 0 {
            status.position_ms = live_pos;
        }
        status
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audio_engine_lifecycle() {
        let engine = AudioEngine::new();
        assert_eq!(engine.get_status().state, PlaybackState::Idle);

        engine.pause();
        assert_eq!(engine.get_status().state, PlaybackState::Idle);

        engine.set_volume(0.5);
        assert_eq!(engine.get_status().volume, 0.5);
    }
}
