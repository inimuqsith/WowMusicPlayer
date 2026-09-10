use cpal::traits::{DeviceTrait, HostTrait};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

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
}

pub struct AudioEngine {
    status: Mutex<PlaybackStatus>,
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioEngine {
    pub fn new() -> Self {
        Self {
            status: Mutex::new(PlaybackStatus {
                state: PlaybackState::Idle,
                current_track_id: None,
                position_ms: 0,
                duration_ms: 0,
                volume: 0.85,
                audio_quality: "Lossless FLAC 24-bit / 96 kHz".to_string(),
                sample_rate: 96000,
                bit_depth: 24,
            }),
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
    }

    pub fn pause(&self) {
        let mut status = self.status.lock();
        if status.state == PlaybackState::Playing {
            status.state = PlaybackState::Paused;
        }
    }

    pub fn resume(&self) {
        let mut status = self.status.lock();
        if status.state == PlaybackState::Paused {
            status.state = PlaybackState::Playing;
        }
    }

    pub fn stop(&self) {
        let mut status = self.status.lock();
        status.state = PlaybackState::Stopped;
        status.position_ms = 0;
    }

    pub fn seek(&self, position_ms: u64) {
        let mut status = self.status.lock();
        status.position_ms = position_ms.min(status.duration_ms);
    }

    pub fn set_volume(&self, vol: f32) {
        let mut status = self.status.lock();
        status.volume = vol.clamp(0.0, 1.0);
    }

    pub fn get_status(&self) -> PlaybackStatus {
        self.status.lock().clone()
    }
}
