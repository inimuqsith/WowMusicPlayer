<div align="center">

# 🎵 WowMusicPlayer

**The Ultimate Cross-Platform Music Player & Independent Universal Playlist Hub**

[![Platform](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS%20%7C%20Android%20%7C%20iOS-blue)](https://github.com/inimuqsith/WowMusicPlayer)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-orange)](https://v2.tauri.app/)
[![Rust](https://img.shields.io/badge/Audio%20Core-Rust-red)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[English](README.md) | Bahasa Indonesia

<p align="center">
  <em>Bangun dan miliki sistem playlist Anda sendiri. Satukan, atur, dan putar musik dari <strong>Spotify, YouTube Music, Apple Music, TIDAL, dan File Lokal</strong> dalam satu aplikasi — dengan kebebasan penuh memilih layanan streaming yang Anda inginkan.</em>
</p>

</div>

---

## ✨ Pilar Utama Aplikasi

### 🗂️ Sistem Playlist Mandiri (Independent Universal Playlist Engine)
- **Miliki Playlist Anda Sendiri**: Bebas dari keterikatan satu platform (*vendor lock-in*). Buat "Super-Playlist" kustom yang menggabungkan lagu dari Spotify, YouTube Music, TIDAL, dan penyimpanan lokal ke dalam satu antrean utuh.
- **Impor dari Mana Saja**: Cukup tempel link URL publik playlist (Spotify, YouTube Music, Apple Music) atau impor format standar (`.m3u`, `.csv`, `.json`).
- **Bebas Memilih Provider Pemutaran**: Pengguna bebas menentukan sumber pemutaran tiap lagu! Putar langsung via Spotify, YouTube Music, TIDAL, atau file lokal sesuai akun dan preferensi yang Anda miliki.

### 🎤 Immersive Live Lyrics Engine
- **Lirik Real-Time Kata-demi-Kata**: Tampilan karaoke dinamis dengan efek *glow* kata-demi-kata dan gulir otomatis baris-demi-baris bertenaga **LRCLIB** serta parser lirik multi-sumber.
- **Desktop Floating Overlay**: Jendela lirik mini transparan yang melayang di layar saat aplikasi diminimalkan.
- **Click-to-Seek**: Ketuk baris lirik mana saja untuk langsung melompatkan posisi lagu ke detik tersebut.

### ☁️ WowCloud & Brankas Sesi Terenkripsi Zero-Knowledge
- **Satu Akun untuk Semua**: Cukup login sekali untuk menyinkronkan seluruh playlist gabungan, metadata lagu, dan riwayat pemutaran di semua perangkat Anda.
- **Enkripsi Sisi-Klien (AES-256-GCM + Argon2id)**: Kredensial dan sesi streaming pihak ketiga dienkripsi secara lokal di perangkat sebelum dicadangkan ke cloud. Server cloud tidak dapat membaca token teks biasa Anda.
- **Cross-Device Handoff**: Kendalikan pemutaran di PC langsung dari smartphone Anda, atau transfer antrean lagu antar-perangkat.

### 🎛️ Engine Audio Native Berperforma Tinggi
- **Arsitektur Rust**: Ditenagai Rust (`cpal` + `symphonia`) untuk latensi ultra-rendah, konsumsi memori minim, dan routing hardware murni (WASAPI, CoreAudio, ALSA).
- **Format File Lengkap**: Pemutaran langsung file lokal FLAC, ALAC, WAV, DSD, AIFF, MP3, AAC, dan Opus berdampingan dengan musik cloud.
- **Gapless Playback**: Transisi halus antar lagu tanpa jeda sunyi.

---

## 🚀 Memulai (Getting Started)

### Prasyarat
- [Rust](https://rustup.rs/) (versi stabil terbaru)
- [Node.js](https://nodejs.org/) (v18+) & `pnpm`
- Dependencies sistem Linux:
  ```bash
  # Arch / CachyOS
  sudo pacman -S --needed webkit2gtk-4.1 base-devel alsa-lib
  
  # Ubuntu / Debian
  sudo apt install libasound2-dev libwebkit2gtk-4.1-dev build-essential
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
- [x] Perancangan Arsitektur & Spesifikasi Produk (PRD v0.5.0)
- [x] Scaffolding Tauri v2 + Rust Core + React 19 UI
- [x] Client-Side Crypto Vault (AES-256-GCM + Argon2id)
- [x] Live Lyrics Engine (LRCLIB Client & LRC Parser)
- [ ] Fase 1: CRUD Sistem Playlist Mandiri & Import Multi-Platform
- [ ] Fase 2: Router Pemutaran Multi-Provider (Spotify, YouTube Music, TIDAL, Lokal)
- [ ] Fase 3: Deployment WowCloud Vault & Sinkronisasi Playlist (VPS `vps-advin`)
- [ ] Fase 4: Cross-Device Remote Control & Handoff
- [ ] Fase 5: Rilis Resmi Multiplatform (Linux, Windows, macOS, Android, iOS)

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat [LICENSE](LICENSE) untuk informasi lebih lanjut.
