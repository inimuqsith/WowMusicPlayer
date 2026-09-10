pub mod aggregator;
pub mod audio;
pub mod lyrics;
pub mod vault;

use aggregator::{IsrcMatcher, MatchConfidence, UnifiedTrack};
use audio::{AudioDeviceInfo, AudioEngine, PlaybackStatus};
use lyrics::{LyricsEngine, LyricsPayload};
use std::sync::Arc;
use tauri::State;
use vault::{CryptoVault, EncryptedVaultItem};

pub struct AppState {
    pub audio_engine: Arc<AudioEngine>,
}

#[tauri::command]
fn get_audio_devices() -> Vec<AudioDeviceInfo> {
    AudioEngine::get_available_devices()
}

#[tauri::command]
fn play_track(state: State<AppState>, track_id: String, duration_ms: u64, quality_label: String) -> PlaybackStatus {
    state.audio_engine.play_track(&track_id, duration_ms, &quality_label);
    state.audio_engine.get_status()
}

#[tauri::command]
fn pause_playback(state: State<AppState>) -> PlaybackStatus {
    state.audio_engine.pause();
    state.audio_engine.get_status()
}

#[tauri::command]
fn resume_playback(state: State<AppState>) -> PlaybackStatus {
    state.audio_engine.resume();
    state.audio_engine.get_status()
}

#[tauri::command]
fn seek_playback(state: State<AppState>, position_ms: u64) -> PlaybackStatus {
    state.audio_engine.seek(position_ms);
    state.audio_engine.get_status()
}

#[tauri::command]
fn set_volume(state: State<AppState>, volume: f32) -> PlaybackStatus {
    state.audio_engine.set_volume(volume);
    state.audio_engine.get_status()
}

#[tauri::command]
fn get_playback_status(state: State<AppState>) -> PlaybackStatus {
    state.audio_engine.get_status()
}

#[tauri::command]
async fn fetch_lyrics(
    track_name: String,
    artist_name: String,
    album_name: Option<String>,
    duration_secs: Option<u32>,
) -> Result<LyricsPayload, String> {
    LyricsEngine::fetch_lyrics(&track_name, &artist_name, album_name.as_deref(), duration_secs).await
}

#[tauri::command]
fn vault_encrypt(password: String, plaintext: String) -> Result<EncryptedVaultItem, String> {
    CryptoVault::encrypt(&password, &plaintext)
}

#[tauri::command]
fn vault_decrypt(password: String, item: EncryptedVaultItem) -> Result<String, String> {
    CryptoVault::decrypt(&password, &item)
}

#[tauri::command]
fn match_track_isrc(
    source_track: UnifiedTrack,
    candidate_title: String,
    candidate_artist: String,
    candidate_duration: u32,
    candidate_isrc: Option<String>,
) -> (bool, MatchConfidence) {
    IsrcMatcher::score_match(
        &source_track,
        &candidate_title,
        &candidate_artist,
        candidate_duration,
        candidate_isrc.as_deref(),
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        audio_engine: Arc::new(AudioEngine::new()),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            play_track,
            pause_playback,
            resume_playback,
            seek_playback,
            set_volume,
            get_playback_status,
            fetch_lyrics,
            vault_encrypt,
            vault_decrypt,
            match_track_isrc,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
