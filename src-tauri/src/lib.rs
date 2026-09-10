pub mod aggregator;
pub mod audio;
pub mod db;
pub mod lyrics;
pub mod tidal;
pub mod vault;

use aggregator::{IsrcMatcher, MatchConfidence, UnifiedTrack};
use audio::{AudioDeviceInfo, AudioEngine, PlaybackStatus};
use db::{Database, Playlist, TrackItem};
use lyrics::{LyricsEngine, LyricsPayload};
use std::sync::Arc;
use tauri::{Manager, State};
use tidal::{DeviceAuthResponse, TidalClient, TidalPlaybackInfo, TidalToken, TidalTrack};
use vault::{CryptoVault, EncryptedVaultItem};

pub struct AppState {
    pub audio_engine: Arc<AudioEngine>,
    pub db: Arc<Database>,
    pub tidal: Arc<TidalClient>,
}

#[tauri::command]
fn get_audio_devices() -> Vec<AudioDeviceInfo> {
    AudioEngine::get_available_devices()
}

#[tauri::command]
fn set_audio_device(state: State<AppState>, device_name: String, exclusive: bool) -> PlaybackStatus {
    state.audio_engine.set_output_device(&device_name, exclusive);
    state.audio_engine.get_status()
}

#[tauri::command]
fn set_exclusive_mode(state: State<AppState>, enabled: bool) -> PlaybackStatus {
    state.audio_engine.set_exclusive_mode(enabled);
    state.audio_engine.get_status()
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

// Database IPC commands
#[tauri::command]
fn db_get_playlists(state: State<AppState>) -> Result<Vec<Playlist>, String> {
    state.db.get_playlists().map_err(|e| e.to_string())
}

#[tauri::command]
fn db_create_playlist(
    state: State<AppState>,
    title: String,
    description: Option<String>,
    cover_url: Option<String>,
) -> Result<Playlist, String> {
    state
        .db
        .create_playlist(&title, description.as_deref(), cover_url.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn db_delete_playlist(state: State<AppState>, playlist_id: String) -> Result<bool, String> {
    state.db.delete_playlist(&playlist_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_get_playlist_tracks(state: State<AppState>, playlist_id: String) -> Result<Vec<TrackItem>, String> {
    state
        .db
        .get_playlist_tracks(&playlist_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn db_add_track_to_playlist(
    state: State<AppState>,
    playlist_id: String,
    track: TrackItem,
) -> Result<(), String> {
    state
        .db
        .add_track_to_playlist(&playlist_id, &track)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn db_remove_track_from_playlist(
    state: State<AppState>,
    playlist_id: String,
    track_id: String,
) -> Result<(), String> {
    state
        .db
        .remove_track_from_playlist(&playlist_id, &track_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn db_update_preferred_provider(
    state: State<AppState>,
    track_id: String,
    preferred_provider: String,
) -> Result<(), String> {
    state
        .db
        .update_preferred_provider(&track_id, &preferred_provider)
        .map_err(|e| e.to_string())
}

// TIDAL IPC commands
#[tauri::command]
async fn tidal_start_device_auth(state: State<'_, AppState>) -> Result<DeviceAuthResponse, String> {
    state.tidal.start_device_auth().await
}

#[tauri::command]
async fn tidal_poll_device_token(
    state: State<'_, AppState>,
    device_code: String,
) -> Result<Option<TidalToken>, String> {
    state.tidal.poll_device_token(&device_code).await
}

#[tauri::command]
async fn tidal_search_track(
    state: State<'_, AppState>,
    query: String,
    token: Option<String>,
) -> Result<Vec<TidalTrack>, String> {
    state.tidal.search_track(&query, token.as_deref()).await
}

#[tauri::command]
async fn tidal_get_playback_info(
    state: State<'_, AppState>,
    track_id: u64,
    token: String,
    quality: Option<String>,
) -> Result<TidalPlaybackInfo, String> {
    state
        .tidal
        .get_playback_info(track_id, &token, quality.as_deref())
        .await
}

#[tauri::command]
async fn toggle_floating_lyrics(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(overlay) = app.get_webview_window("lyrics-overlay") {
        if overlay.is_visible().unwrap_or(false) {
            let _ = overlay.hide();
            return Ok(false);
        } else {
            let _ = overlay.show();
            let _ = overlay.set_focus();
            return Ok(true);
        }
    }

    let overlay = tauri::WebviewWindowBuilder::new(
        &app,
        "lyrics-overlay",
        tauri::WebviewUrl::App("index.html?window=overlay".into()),
    )
    .title("WowMusic Floating Lyrics")
    .inner_size(520.0, 140.0)
    .min_inner_size(360.0, 100.0)
    .resizable(true)
    .transparent(true)
    .always_on_top(true)
    .decorations(false)
    .shadow(false)
    .build()
    .map_err(|e| format!("Failed to create floating window: {}", e))?;

    let _ = overlay.show();
    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            let _ = std::fs::create_dir_all(&data_dir);
            let db_path = data_dir.join("wowmusic_library.db");

            let database = Database::new_at_path(&db_path)
                .unwrap_or_else(|_| Database::new_in_memory().expect("failed in-memory db fallback"));
            let _ = database.seed_defaults_if_empty();

            let app_state = AppState {
                audio_engine: Arc::new(AudioEngine::new()),
                db: Arc::new(database),
                tidal: Arc::new(TidalClient::new()),
            };
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            set_audio_device,
            set_exclusive_mode,
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
            db_get_playlists,
            db_create_playlist,
            db_delete_playlist,
            db_get_playlist_tracks,
            db_add_track_to_playlist,
            db_remove_track_from_playlist,
            db_update_preferred_provider,
            tidal_start_device_auth,
            tidal_poll_device_token,
            tidal_search_track,
            tidal_get_playback_info,
            toggle_floating_lyrics,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
