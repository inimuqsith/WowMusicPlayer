<div align="center">

# 🎵 WowMusicPlayer

**The Ultimate Cross-Platform Hi-Fi Music Player & Universal Playlist Hub**

[![Platform](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS%20%7C%20Android%20%7C%20iOS-blue)](https://github.com/inimuqsith/WowMusicPlayer)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-orange)](https://v2.tauri.app/)
[![Rust](https://img.shields.io/badge/Audio%20Core-Rust-red)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

English | [Bahasa Indonesia](README_ID.md)

<p align="center">
  <em>Aggregate your fragmented playlists from Spotify, YouTube Music, and Apple Music into high-resolution TIDAL Lossless playback, enjoy real-time karaoke live lyrics, and seamlessly sync your sessions across devices with a zero-knowledge encrypted cloud vault.</em>
</p>

</div>

---

## ✨ Key Features

### 🔄 Universal Playlist Aggregator & Smart Matcher
- **Consolidate Fragmented Playlists**: Import and unify your favorite playlists from **Spotify, YouTube Music, Apple Music, TIDAL, and Local Files** into unified "Super-Playlists".
- **Audio Up-Resolution**: Tracks from Spotify/YT Music playlists are intelligently mapped via ISRC codes to the **TIDAL HiFi/Master (FLAC Lossless)** catalog for audiophile-grade fidelity.
- **Deduplication & Auto-Sync**: Automatically detects duplicate songs across platforms and keeps playlists in sync.

### ☁️ WowCloud & Encrypted Credential Vault
- **Single Sign-On (SSO)**: One master cloud account to manage and synchronize your entire music world.
- **Client-Side Zero-Knowledge Encryption**: Third-party streaming credentials (TIDAL tokens, Spotify sessions) are encrypted client-side using **AES-256-GCM + Argon2id** before cloud synchronization. Even the cloud server cannot read your plain-text tokens.
- **Cross-Device Handoff**: Control desktop or laptop playback remotely from your mobile device, or seamlessly transfer your playback queue.

### 🎤 Immersive Live Lyrics Engine
- **Word-by-Word Real-Time Sync**: Smooth karaoke-style word-by-word glow and line-by-line scrolling powered by **LRCLIB** and **TIDAL Timed Lyrics**.
- **Desktop Floating Overlay**: Minimal translucent widget floating on top of work windows when minimized.
- **Click-to-Seek & Instrumental Detection**: Jump to any section of the song by tapping lyric lines, with visual indicators for instrumental breaks.

### 🎛️ Audiophile-Grade Bit-Perfect Engine
- **Bit-Perfect Output**: Bypass operating system audio mixers for pristine delivery to external DACs (WASAPI Exclusive, CoreAudio Hog Mode, ALSA Direct).
- **Comprehensive Format Support**: FLAC, ALAC, WAV, DSD (DSF/DFF), AIFF, MP3, Opus, AAC.
- **Gapless Playback**: Zero-silence transitions between consecutive tracks with sample-rate auto-switching.

---

## 🚀 Getting Started

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable toolchain)
- [Node.js](https://nodejs.org/) (v18+) & `pnpm`
- Linux System Dependencies (if building on Linux):
  ```bash
  sudo apt install libasound2-dev libpipewire-0.3-dev libwebkit2gtk-4.1-dev \
    build-essential curl wget file libssl-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev
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
- [x] Architecture Blueprint & Product Requirements (PRD v0.4.0)
- [ ] Phase 1: Audio Core Engine & Local Playback
- [ ] Phase 2: TIDAL HiFi Streaming & Live Lyrics (LRCLIB)
- [ ] Phase 3: WowCloud Vault & Session Sync (Deployment on `vps-advin`)
- [ ] Phase 4: Universal Playlist Aggregator (Spotify & YT Music import)
- [ ] Phase 5: Cross-Device Playback Handoff
- [ ] Phase 6: Production Multiplatform Release (Desktop & Mobile)

---

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
