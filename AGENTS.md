# WowMusicPlayer - AI Agent & Developer Guidelines

Dokumen ini adalah pedoman operasional mutlak bagi AI Agent (Antigravity, Cursor, GitHub Copilot) dan developer manusia yang berkontribusi pada pengembangan **WowMusicPlayer**.

---

## 1. Visi & Lingkup Proyek
**WowMusicPlayer** adalah *unified cross-platform music hub* (Linux, Windows, macOS, Android, iOS) yang memadukan:
1. **Universal Playlist Aggregator**: Penyatuan playlist Spotify, YouTube Music, Apple Music, TIDAL, dan File Lokal menjadi satu perpustakaan terpadu.
2. **Audio Up-Resolution**: Pemutaran lossless beresolusi tinggi via **TIDAL HiFi/Master** menggunakan pencocokan ISRC otomatis.
3. **WowCloud & Encrypted Vault**: Sinkronisasi akun, sesi login, dan token OAuth terenkripsi client-side (AES-256-GCM + Argon2id).
4. **Live Lyrics Engine**: Sinkronisasi lirik kata-demi-kata (LRCLIB + TIDAL API) dengan desktop floating widget.
5. **Cross-Device Handoff**: Kontrol pemutaran jarak jauh antar-perangkat via WebSocket (Desktop & Smartphone).
6. **Bit-Perfect Audio Engine**: Rust-based audio pipeline untuk output murni ke DAC eksternal (WASAPI Exclusive, CoreAudio, ALSA).

---

## 2. Tech Stack & Aturan Arsitektur
- **Desktop & Mobile Shell**: **Tauri v2** (Cross-platform ke Desktop & Mobile).
- **Core Backend (Rust)**:
  - Audio: `cpal`, `symphonia`, `rodio`.
  - Crypto / Vault: `aes-gcm`, `argon2` (Client-side zero-knowledge encryption).
  - Storage: `rusqlite` / `sqlx` untuk cache metadata offline.
- **Frontend (Presentation)**:
  - Framework: React 18+ / TypeScript / Vite.
  - Styling: Tailwind CSS, Lucide Icons, Framer Motion.
- **Cloud Backend (Hosted di VPS vps-advin)**:
  - PostgreSQL, Auth, Realtime WebSockets, Encrypted Vault Storage.

### Aturan Arsitektur Emas (Golden Rules)
1. **Decoupled Audio Core**: Seluruh manipulasi audio PCM, decoding, dan komunikasi hardware audio WAJIB berada di layer Rust. UI hanya mengirimkan perintah high-level (Play, Pause, Seek, SetVolume) via Tauri IPC.
2. **Zero Plaintext Secrets**: Kredensial TIDAL, token Spotify, dan session cookie DILARANG KERAS disimpan dalam plain-text di storage biasa atau dicatat di log. Kredensial cloud wajib dienkripsi dengan AES-256-GCM sebelum menyentuh jaringan.
3. **Cross-Platform Parity**: Setiap fungsi baru yang berinteraksi dengan OS (misal: audio device, media keys, keyring) harus memiliki implementasi yang aman untuk Linux, Windows, macOS, Android, dan iOS.
4. **Lossless Playback Priority**: Jangan pernah melakukan kompresi ulang (re-encoding) lossy pada aliran audio TIDAL FLAC lokal kecuali pengguna secara sengaja memilih mode hemat kuota.

---

## 3. Alur Kerja Kode & Kualitas
1. **Pola Desain**:
   - Rust: Clean Modular Architecture (modul `audio`, `sync`, `vault`, `tidal`, `aggregator`, `lyrics`).
   - Frontend: Clean Architecture dengan Zustand / TanStack Query untuk state management.
2. **Format Commit**: Gunakan Conventional Commits:
   - `feat(audio): implement bit-perfect wasapi exclusive mode`
   - `fix(lyrics): resolve word-by-word timestamp drift on seek`
   - `feat(vault): add aes-256-gcm client-side session encryption`
   - `feat(aggregator): add isrc matching against tidal catalog`
3. **Checklist Verifikasi Sebelum Selesai**:
   - [ ] `cargo check` dan `cargo clippy` lulus tanpa warning kritis.
   - [ ] Unit test untuk ISRC matcher dan crypto vault berjalan 100% pass.
   - [ ] Tidak ada file kredensial atau token yang bocor ke git tracking.
