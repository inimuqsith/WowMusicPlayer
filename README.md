<div align="center">

# 🎵 WowMusicPlayer

**The Ultimate Cross-Platform Music Player & Independent Universal Playlist Hub**

[![Platform](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS%20%7C%20Android%20%7C%20iOS-blue)](https://github.com/inimuqsith/WowMusicPlayer)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-orange)](https://v2.tauri.app/)
[![Rust](https://img.shields.io/badge/Audio%20Core-Rust-red)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

English | [Bahasa Indonesia](README_ID.md)

<p align="center">
  <em>Build and own your unified playlists. Seamlessly combine, organize, and play your music from <strong>Spotify, YouTube Music, Apple Music, TIDAL, and Local Files</strong> in one single player — with complete freedom to stream from whatever service you prefer.</em>
</p>

</div>

---

## ✨ Core Pillars

### 🗂️ Independent Universal Playlist Engine
- **Create & Own Your Playlists**: Break free from platform lock-in. Build your own "Super-Playlists" that mix songs from Spotify, YouTube Music, TIDAL, and your local disk into a single cohesive queue.
- **Import from Any Source**: One-click import via public playlist URLs (Spotify, YouTube Music, Apple Music) or standard file formats (`.m3u`, `.csv`, `.json`).
- **Provider-Agnostic Freedom**: You choose where each track plays from! Stream natively via Spotify, YouTube Music, TIDAL, or local files depending on your subscriptions and preferences.

### 🎤 Immersive Live Lyrics Engine
- **Real-Time Word-by-Word Sync**: Fluid karaoke glow and synchronized line scrolling powered by **LRCLIB** and multi-source lyrics scrapers.
- **Desktop Floating Overlay**: Keep your lyrics floating on screen while working in other apps.
- **Interactive Click-to-Seek**: Tap any lyric line to jump directly to that timestamp in the audio.

### ☁️ WowCloud & Zero-Knowledge Session Vault
- **One Account to Sync Everything**: Sign in once to sync all your unified playlists, song metadata, and playback history across all your devices.
- **Client-Side Encryption (AES-256-GCM + Argon2id)**: Third-party streaming credentials and sessions are encrypted locally on your device before cloud backup. Zero-knowledge guarantee: even the cloud server cannot read your plain-text tokens.
- **Cross-Device Handoff**: Control desktop playback from your smartphone or switch audio playback seamlessly.

### 🎛️ High-Performance Native Audio Engine
- **Rust-Powered Pipeline**: Built on Rust (`cpal` + `symphonia`) for ultra-low latency, clean memory usage, and direct hardware output (WASAPI, CoreAudio, ALSA).
- **Universal Format Support**: Direct playback of local FLAC, ALAC, WAV, DSD, AIFF, MP3, AAC, and Opus files alongside cloud streams.
- **Gapless Playback**: Continuous transitions between tracks with no silence gaps.

---

## 🚀 Getting Started

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable toolchain)
- [Node.js](https://nodejs.org/) (v18+) & `pnpm`
- Linux System Dependencies (if building on Linux):
  ```bash
  # Arch / CachyOS
  sudo pacman -S --needed webkit2gtk-4.1 base-devel alsa-lib
  
  # Ubuntu / Debian
  sudo apt install libasound2-dev libwebkit2gtk-4.1-dev build-essential
  ```

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/inimuqsith/WowMusicPlayer.git
cd WowMusicPlayer

# Install frontend dependencies
pnpm install

# Run in development mode (Tauri v2)
pnpm tauri dev
```

---

## 🗺️ Roadmap
- [x] Architecture Blueprint & Product Requirements (PRD v0.5.0)
- [x] Scaffolding Tauri v2 + Rust Core + React 19 UI
- [x] Client-Side Crypto Vault (AES-256-GCM + Argon2id)
- [x] Live Lyrics Engine (LRCLIB Client & LRC Parser)
- [x] Universal Playlist CRUD & SQLite Persistent Storage (v0.2.0)
- [x] TIDAL HiFi OAuth2 Device Code Flow & Stream Resolver (v0.3.0)
- [x] Live Lyrics Click-to-Seek & Desktop Floating Overlay (v0.4.0)
- [ ] Multi-Provider Playback Router & Real URL Importer (Spotify, YouTube Music, Local)
- [ ] WowCloud Vault & Playlist Sync Deployment (VPS `vps-advin` / WebSocket Handoff)
- [ ] Production Multiplatform Releases (Linux, Windows, macOS, Android, iOS)

---

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
