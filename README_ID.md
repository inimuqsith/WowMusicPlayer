<div align="center">

# 🎵 WowMusicPlayer

**The Ultimate Cross-Platform Hi-Fi Music Player & Universal Playlist Hub**

[![Platform](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS%20%7C%20Android%20%7C%20iOS-blue)](https://github.com/inimuqsith/WowMusicPlayer)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-orange)](https://v2.tauri.app/)
[![Rust](https://img.shields.io/badge/Audio%20Core-Rust-red)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[English](README.md) | Bahasa Indonesia

<p align="center">
  <em>Satukan seluruh playlist Anda dari Spotify, YouTube Music, dan Apple Music ke dalam pemutaran Hi-Res Lossless TIDAL, nikmati lirik karaoke live, dan sinkronkan sesi Anda di semua perangkat dengan brankas cloud terenkripsi zero-knowledge.</em>
</p>

</div>

---

## ✨ Fitur Unggulan

### 🔄 Universal Playlist Aggregator & Smart Matcher
- **Merekap Playlist Tercecer**: Impor dan satukan playlist favorit Anda dari **Spotify, YouTube Music, Apple Music, TIDAL, dan File Lokal** ke dalam satu perpustakaan terpadu (*Super-Playlists*).
- **Audio Up-Resolution**: Lagu-lagu dari playlist Spotify/YT Music secara cerdas dicocokkan via kode ISRC ke katalog **TIDAL HiFi/Master (FLAC Lossless)** untuk kenikmatan audio resolusi tinggi.
- **Deduplikasi Otomatis**: Mendeteksi dan menghapus lagu duplikat lintas platform secara cerdas.

### ☁️ WowCloud & Encrypted Credential Vault
- **Satu Akun untuk Semua**: Cukup login sekali dengan akun master WowCloud Anda.
- **Enkripsi Zero-Knowledge Sisi-Klien**: Token TIDAL dan sesi streaming terenkripsi secara *client-side* (**AES-256-GCM + Argon2id**) sebelum disinkronkan ke cloud. Server backend pun tidak dapat membaca token teks biasa Anda.
- **Cross-Device Handoff**: Kendalikan pemutaran di PC/laptop Anda langsung dari smartphone Anda (mirip Spotify Connect).

### 🎤 Immersive Live Lyrics Engine
- **Sinkronisasi Real-Time**: Lirik bergulir halus kata-demi-kata (*karaoke glow*) dan baris-demi-baris bertenaga **LRCLIB** dan **TIDAL Timed Lyrics**.
- **Desktop Floating Overlay**: Lirik melayang transparan di atas layar kerja Anda saat aplikasi diminimalkan.
- **Click-to-Seek**: Lompat ke bagian lagu favorit cukup dengan mengklik baris lirik.

### 🎛️ Audiophile-Grade Bit-Perfect Engine
- **Bit-Perfect Output**: Bypass mixer OS untuk audio murni ke DAC eksternal (WASAPI Exclusive, CoreAudio Hog Mode, ALSA Direct).
- **Dukungan Format Lengkap**: FLAC, ALAC, WAV, DSD (DSF/DFF), AIFF, MP3, Opus, AAC.
- **Gapless Playback**: Transisi antar lagu tanpa jeda sunyi (*zero silence gap*) dengan auto-switching sample rate.

---

## 🚀 Memulai (Getting Started)

### Prasyarat
- [Rust](https://rustup.rs/) (versi stabil terbaru)
- [Node.js](https://nodejs.org/) (v18+) & `pnpm`
- Dependencies sistem Linux (jika di Linux):
  ```bash
  sudo apt install libasound2-dev libpipewire-0.3-dev libwebkit2gtk-4.1-dev \
    build-essential curl wget file libssl-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev
  ```

### Instalasi & Menjalankan Mode Pengembangan
```bash
# Clone repositori
git clone https://github.com/inimuqsith/WowMusicPlayer.git
cd WowMusicPlayer

# Install dependencies frontend
pnpm install

# Jalankan dalam mode development (Tauri v2)
pnpm tauri dev
```

---

## 🗺️ Roadmap Singkat
- [x] Perancangan Arsitektur & Spesifikasi Produk (PRD v0.4.0)
- [ ] Fase 1: Audio Engine Dasar & Pemutar Lokal
- [ ] Fase 2: Integrasi TIDAL HiFi & Live Lyrics (LRCLIB)
- [ ] Fase 3: WowCloud Vault & Sinkronisasi Sesi Kredensial (Deploy di `vps-advin`)
- [ ] Fase 4: Universal Playlist Aggregator (Spotify & YT Music import)
- [ ] Fase 5: Cross-Device Handoff (Remote Playback Control)
- [ ] Fase 6: Rilis Cross-Platform Resmi (Desktop & Mobile)

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat [LICENSE](LICENSE) untuk informasi lebih lanjut.
