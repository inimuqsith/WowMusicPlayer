# 📋 PLAN-001: Core Architecture & Native Audio Engine Setup

- **ID Plan**: PLAN-001
- **Status**: Finished
- **Kategori**: Audio Core & Shell Architecture
- **Target File**: 
  - `src-tauri/src/main.rs`
  - `src-tauri/src/audio/engine.rs`
  - `src-tauri/Cargo.toml`
  - `src/App.tsx`
  - `src/index.css`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Proyek awal WowMusicPlayer membutuhkan arsitektur inti yang memisahkan rendering visual (frontend) dengan native audio processing (backend). Kebutuhan mendasar adalah:
1. Menghilangkan ketergantungan pada LiveKit voice room/chat karena WowMusicPlayer difokuskan murni sebagai universal audio player mandiri berstandar Hi-Fi.
2. Membangun Tauri v2 shell lintas-platform dengan native audio engine berbasis Rust (`cpal`, `symphonia`, `rodio`).
3. Memastikan audio output mengalirkan sampel PCM nyata ke hardware output (ALSA / PulseAudio / PipeWire / WASAPI / CoreAudio).

---

### 2. File yang Dibuat & Dimodifikasi
- `src-tauri/Cargo.toml`: Konfigurasi dependensi audio Rust (`cpal`, `symphonia`, `rodio`, `parking_lot`, `tokio`).
- `src-tauri/src/audio/mod.rs` & `src-tauri/src/audio/engine.rs`: Implementasi audio pipeline multi-threaded dengan sink stream native dan kendali play/pause/seek/volume.
- `src-tauri/src/main.rs`: Pendaftaran tauri commands (`play_stream`, `pause_stream`, `resume_stream`, `seek_stream`, `set_volume`).
- `src/App.tsx`: Antarmuka awal React 19 dengan player dock dan visualizer bar.

---

### 3. Rincian Langkah Kerja yang Telah Dijalankan
1. Inisialisasi struktur Tauri v2 di `src-tauri` dan frontend Vite React 19 di root.
2. Implementasi decoding audio multi-format via `symphonia` untuk mendukung MP3, AAC, FLAC, dan WAV.
3. Pembuatan IPC bridge Tauri agar UI dapat mengirimkan perintah playback ke Rust engine tanpa menghambat main UI thread.
4. Fallback HTML5 audio element di frontend untuk lingkungan web development (`pnpm dev` pada browser biasa tanpa runtime Tauri).

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Arsitektur terpisah (*Decoupled Audio Core*) berhasil diwujudkan; UI tidak memanipulasi PCM secara langsung.
- **Dependensi Baru**: `cpal`, `symphonia`, `rodio` pada layer Rust; `lucide-react`, `tailwindcss` pada frontend.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [x] Suara audio terdengar nyata saat tombol Play ditekan (real ALSA/PipeWire PCM output).
- [x] Kompilasi Rust lulus 100% via `cargo check` dan `cargo clippy`.
- [x] Unit test audio command lulus 100%.
- [x] Dicatat dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) entri `[MEM-001]` hingga `[MEM-005]`.
