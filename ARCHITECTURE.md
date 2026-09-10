# Arsitektur Sistem WowMusicPlayer

Dokumen ini merinci rancangan teknis dan arsitektur internal **WowMusicPlayer**, mencakup sistem playlist mandiri, router multi-provider, komponen Rust, sistem enkripsi cloud vault, dan pipeline audio.

---

## 1. Gambaran Umum Sistem

```mermaid
graph TD
    subgraph UI_Layer [Frontend Layer - React + TypeScript]
        PlayerView[Now Playing & Queue View]
        LyricsComp[Live Lyrics Canvas / Floating Overlay]
        UniversalPlaylistView[Independent Universal Playlist View]
        DeviceHandoffView[Cross-Device Remote Control View]
    end

    subgraph IPC_Bridge [Tauri v2 IPC Bridge]
        CommandBus[Tauri Invoke Commands]
        EventBus[Tauri Realtime Events]
    end

    subgraph Core_Rust [Rust Core Services]
        AudioCore[Audio Engine: cpal + symphonia]
        PlaybackRouter[Multi-Provider Playback Router: Spotify / YT / TIDAL / Local]
        AggregatorSvc[Universal Playlist Engine: ISRC & Metadata Matcher]
        VaultSvc[Crypto Engine: Argon2id + AES-GCM-256]
        CloudSyncSvc[WowCloud Realtime Sync Client]
        LocalDBSvc[SQLite Universal Playlists & Local Track Cache]
    end

    subgraph External_Cloud [Layanan Cloud & Eksternal]
        WowCloud[WowCloud Backend - Hosted di vps-advin: Auth, Vault DB, Sync]
        MusicProviders[Streaming APIs: Spotify, YouTube Music, TIDAL]
        LRCLIB[LRCLIB Open Lyrics API]
        Hardware[System Audio Output / DAC]
    end

    UI_Layer <--> IPC_Bridge <--> Core_Rust
    AudioCore --> Hardware
    PlaybackRouter <--> MusicProviders
    VaultSvc <--> WowCloud
    CloudSyncSvc <--> WowCloud
    AudioCore -. Timestamps .-> LyricsComp
    LocalDBSvc <--> LRCLIB
```

---

## 2. Modul-Modul Utama

### 2.1 Independent Universal Playlist Engine
- **Universal Track Metadata Schema**:
  - Setiap trek memiliki identifier unik dan referensi multi-provider:
    ```json
    {
      "id": "trk_0182",
      "title": "Starboy",
      "artist": "The Weeknd, Daft Punk",
      "album": "Starboy",
      "duration_secs": 230,
      "isrc": "USUM71607007",
      "available_providers": ["Spotify", "YouTubeMusic", "Tidal", "Local"],
      "preferred_provider": "Auto"
    }
    ```
- **Penyatuan Playlist Lintas Layanan**:
  - Pengguna dapat membuat "Super-Playlist" yang mencampur lagu dari berbagai sumber tanpa memedulikan batas antar-aplikasi.
  - Mendukung impor dari link publik Spotify, YouTube Music, dan Apple Music.

### 2.2 Multi-Provider Playback Router
- Pengguna bebas memilih ingin memutar lagu melalui **Spotify**, **YouTube Music**, **TIDAL**, atau **File Lokal**.
- Jika provider utama sedang offline atau tidak memiliki lagu tertentu, router secara otomatis mengalihkan aliran pemutaran ke provider alternatif (*smart fallback*).

### 2.3 Audio Pipeline Native Rust
- Menggunakan `cpal` dan `symphonia` untuk decoding dan buffering audio PCM berkualitas tinggi.
- Output murni ke DAC eksternal via mode eksklusif (WASAPI Exclusive, CoreAudio, ALSA).
- Gapless playback antar-lagu.

### 2.4 WowCloud Vault & Client-Side Encryption
- Sesi dan token ketiga pihak (Spotify OAuth, TIDAL token, sesi YouTube) dienkripsi lokal dengan **AES-256-GCM + Argon2id** sebelum disinkronkan ke server backend di `vps-advin`.
- Zero-knowledge: server cloud tidak dapat membaca kredensial pengguna dalam bentuk plain-text.

### 2.5 Live Lyrics Engine
- Bertenaga **LRCLIB Open API** untuk lirik real-time kata-demi-kata bergaya karaoke.
- Dukungan *desktop floating overlay* dan *click-to-seek*.
