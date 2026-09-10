# WowMusicPlayer - AI Agent & Developer Guidelines

Dokumen ini adalah pedoman operasional mutlak bagi AI Agent (Antigravity, Cursor, GitHub Copilot) dan developer manusia yang berkontribusi pada pengembangan **WowMusicPlayer**.

---

## ⚠️ PROTOKOL MUTLAK: WAJIB PLAN SEBELUM IMPLEMENTASI

> **ATURAN BESI UNTUK AI AGENT (ANTIGRAVITY / CURSOR / COPILOT / DEVELOPER):**
> 
> **DILARANG KERAS LANGSUNG MENGEDIT KODE ATAU MEMBUAT ASUMSI SENDIRI ("SOK PAHAM").**
>
> Setiap kali ada penambahan fitur, perubahan kode, perbaikan bug, koreksi arsitektur, refactor, ataupun revisi:
> 
> 1. **WAJIB Membuat Plan Implementasi Terlebih Dahulu**:
>    - Uraikan latar belakang masalah / kebutuhan fitur.
>    - Sebutkan secara spesifik file mana saja yang akan dibuat atau dimodifikasi.
>    - Tuliskan langkah-langkah kerja teknis (*step-by-step breakdown*) secara jelas dan rinci.
>    - Paparkan potensi dampak (*impact analysis*), dependensi baru, atau trade-off.
> 
> 2. **WAJIB Menunggu Peninjauan & Persetujuan Eksplisit dari Pengguna**:
>    - Tampilkan plan tersebut kepada pengguna untuk ditinjau (*review*).
>    - **DILARANG KERAS** menyentuh file kode, menjalankan edit file, atau melakukan eksekusi sebelum pengguna memberikan persetujuan eksplisit (misal: *"Setuju"*, *"Lanjutkan"*, *"Oke Gass"*).
> 
> 3. **Eksekusi Terkendali Sesuai Plan**:
>    - Kerjakan implementasi secara disiplin hanya mengikuti poin-poin yang disetujui.
>    - Jika di tengah jalan ditemukan kendala teknis atau kebutuhan baru di luar cakupan plan, **BERHENTI SEGERA**, lalu ajukan revisi plan kepada pengguna untuk ditinjau ulang.
>
> 4. **WAJIB Verifikasi Fungsi Nyata (Real End-to-End Testing - NO FAKE / NO SLOP)**:
>    - **Dilarang Keras Klaim Palsu**: Dilarang mengklaim fitur selesai hanya karena kode lulus `cargo check` atau sekadar timer `setInterval` palsu di frontend.
>    - **Audio Wajib Bersuara Nyata**: Modul audio wajib mengalirkan sampel PCM nyata ke hardware output (ALSA / PulseAudio / PipeWire / WASAPI / CoreAudio) via `cpal` & `symphonia`. Suara harus benar-benar terdengar dari speaker/headphone pengguna saat tombol Play ditekan.
>    - **Standar UI Apple Music / Hi-Fi Premium (Zero-Slop)**:
>      - **Haram Menggunakan Dialog Browser**: DILARANG KERAS menggunakan `alert()`, `confirm()`, atau `prompt()` bawaan browser.
>      - **Bebas Pop-Up Penghalang & Spam Toast**: Pemutaran lagu harus instan dan hening (*unobtrusive*). Dilarang keras menampilkan pop-up modal penghalang atau spam notifikasi toast setiap kali pengguna menekan tombol Play.
>      - **Haram Menggunakan Jargon Teknis Developer**: DILARANG KERAS menampilkan istilah seperti *"Musik Asli"*, *"LRCLIB (Time-Synced)"*, *"Master Audio 256kbps"*, *"AES-256-GCM Vault"*, *"Connected to VPS"*. Gunakan copywriting konsumer elegan: *"Dengarkan Musik Favorit"*, *"Lagu Populer Dunia"*, *"Lirik"*.
>      - **Lirik Nyata & Dinamis (No Fake Lyrics)**: Lirik wajib diambil secara dinamis dari LRCLIB sesuai lagu dan artis yang sedang diputar. Dilarang keras menampilkan lirik palsu/statis dari lagu lain (seperti Bohemian Rhapsody) jika lirik lagu tersebut tidak ditemukan.
>      - Desain antarmuka wajib mengacu pada estetika **Apple Music / Modern Hi-Fi**: Canvas hitam pekat OLED (`#000000`), ambient glow halus, floating glass capsule/dock controls, typografi tajam dan lapang.
>      - Enkripsi Vault (AES-256-GCM) wajib bekerja otomatis di latar belakang (*invisible zero-knowledge*), berbasis akun (Google Sign-In).
>    - **Pengujian Nyata Sebelum Menutup Task**: Wajib memverifikasi aplikasi secara live di desktop/browser sebelum menyatakan milestone selesai.

---

## 1. Visi & Lingkup Proyek
**WowMusicPlayer** adalah *independent universal music & playlist hub* lintas platform (Linux, Windows, macOS, Android, iOS) yang memadukan:
1. **Sistem Playlist Mandiri (Universal Playlist Hub)**: Membangun perpustakaan playlist sendiri yang menyatukan lagu dari Spotify, YouTube Music, Apple Music, TIDAL, dan File Lokal dalam satu antrean utuh.
2. **Kebebasan Provider Pemutaran (Provider-Agnostic)**: Pengguna memiliki kendali penuh dan bebas memilih sumber pemutaran (Spotify, YouTube Music, TIDAL, atau file lokal) tanpa memaksakan satu provider tertentu.
3. **WowCloud & Encrypted Vault**: Sinkronisasi akun, playlist kustom, sesi login, dan token OAuth terenkripsi client-side (AES-256-GCM + Argon2id).
4. **Live Lyrics Engine**: Sinkronisasi lirik kata-demi-kata (LRCLIB & multi-sumber) dengan widget desktop floating overlay.
5. **Cross-Device Handoff**: Kontrol dan transfer pemutaran antar-perangkat via WebSocket (Desktop & Smartphone).
6. **Native Audio Engine**: Rust-based audio pipeline untuk output murni ke DAC eksternal (WASAPI, CoreAudio, ALSA).

---

## 2. Tech Stack & Aturan Arsitektur
- **Desktop & Mobile Shell**: **Tauri v2** (Cross-platform ke Desktop & Mobile).
- **Core Backend (Rust)**:
  - Audio: `cpal`, `symphonia`, `rodio`.
  - Crypto / Vault: `aes-gcm`, `argon2` (Client-side zero-knowledge encryption).
  - Storage: `rusqlite` / `sqlx` untuk cache metadata dan playlist offline.
- **Frontend (Presentation)**:
  - Framework: React 19 / TypeScript / Vite.
  - Styling: Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Cloud Backend (Hosted di VPS vps-advin)**:
  - PostgreSQL, Auth, Realtime WebSockets, Encrypted Vault Storage.

### Aturan Arsitektur Emas (Golden Rules)
1. **Universal Playlist Sovereignty**: Format playlist WowMusic harus independen dari platform mana pun. Setiap item lagu menyimpan referensi multi-provider (Spotify ID, YouTube ID, TIDAL ID, ISRC, path lokal).
2. **Provider Agnostic**: Dilarang mengunci fitur hanya untuk satu provider komersial. Berikan opsi fallback dan kebebasan pengguna untuk memutar lagu via Spotify, YouTube, TIDAL, atau File Lokal.
3. **Decoupled Audio Core**: Seluruh manipulasi audio PCM, decoding, dan komunikasi hardware audio WAJIB berada di layer Rust. UI hanya mengirimkan perintah high-level (Play, Pause, Seek, SetVolume) via Tauri IPC.
4. **Zero Plaintext Secrets**: Kredensial TIDAL, token Spotify, dan session cookie DILARANG KERAS disimpan dalam plain-text di storage biasa atau dicatat di log. Kredensial cloud wajib dienkripsi dengan AES-256-GCM sebelum menyentuh jaringan.
5. **Cross-Platform Parity**: Setiap fungsi baru yang berinteraksi dengan OS (misal: audio device, media keys, keyring) harus memiliki implementasi yang aman untuk Linux, Windows, macOS, Android, dan iOS.

---

## 3. Alur Kerja Kode & Kualitas
1. **Pola Desain**:
   - Rust: Clean Modular Architecture (modul `audio`, `sync`, `vault`, `aggregator`, `lyrics`).
   - Frontend: Clean Architecture dengan Zustand / TanStack Query untuk state management.
2. **Format Commit**: Gunakan Conventional Commits:
   - `feat(playlist): add universal playlist CRUD and multi-source track references`
   - `feat(audio): implement multi-provider stream resolver`
   - `fix(lyrics): resolve word-by-word timestamp drift on seek`
   - `feat(vault): add aes-256-gcm client-side session encryption`
3. **Checklist Verifikasi Sebelum Selesai**:
   - [ ] `cargo check` dan `cargo clippy` lulus tanpa warning kritis.
   - [ ] Unit test untuk ISRC matcher dan crypto vault berjalan 100% pass.
   - [ ] Tidak ada file kredensial atau token yang bocor ke git tracking.
