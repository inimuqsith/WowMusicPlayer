# Project Memory & Architecture Log (MEMORY.md)

---

## 📌 Document Metadata
- **Project Name:** WowMusicPlayer
- **Document Version:** 1.0.0
- **Document Status:** `LIVING DOCUMENT / ACTIVE BASELINE`
- **Initial Creation Date:** `2026-09-10 16:28:10 +07:00`
- **Last Updated:** `2026-09-10 16:28:10 +07:00`
- **Primary Authors:** 
  - Abdul Muqsith ([@inimuqsith](https://github.com/inimuqsith)) — *Lead Developer & Product Owner*
  - Antigravity AI (Google DeepMind) — *Pair Programming Agent*
- **Repository:** [https://github.com/inimuqsith/WowMusicPlayer](https://github.com/inimuqsith/WowMusicPlayer)
- **Classification:** Project Architecture, Context Memory & Decision Registry

---

## 1. Visi Utama & Identitas Produk

### 1.1 Visi Inti: Sistem Playlist Mandiri (Universal Playlist Hub)
**WowMusicPlayer** adalah pemutar musik mandiri yang memecahkan masalah fragmentasi musik. Pengguna memiliki koleksi lagu yang terpecah di berbagai layanan (Spotify, YouTube Music, Apple Music, TIDAL, dan File Lokal). WowMusicPlayer merekap seluruh lagu tersebut ke dalam **Sistem Playlist Mandiri (*Universal Super-Playlists*)**.

### 1.2 Prinsip Kebebasan Provider (Provider-Agnostic)
Aplikasi ini **TIDAK MENGUNCI ATAU MEMPRIORITASKAN SATU PLATFORM (seperti TIDAL)**. Pengguna memiliki hak penuh dan kebebasan mutlak untuk memilih sumber pemutaran (*Playback Provider*):
- Pengguna bebas memutar via **Spotify** (jika memiliki Spotify).
- Pengguna bebas memutar via **YouTube Music**.
- Pengguna bebas memutar via **TIDAL HiFi** (jika berlangganan TIDAL).
- Pengguna bebas memutar via **File Lokal / Offline Storage**.
- Format playlist menyimpan metadata netral (ISRC, Judul, Artis, Album, Durasi) dengan referensi multi-provider.

### 1.3 Bentuk Rilis: Aplikasi Native Multiplatform (Bukan Web)
Aplikasi dikompilasi langsung menjadi **Aplikasi Standalone Native**:
- **Linux:** `.AppImage`, `.deb`, `.rpm`, Flatpak.
- **Windows:** `.exe` installer & `.msi` (dengan integrasi media keys & tray).
- **macOS:** `.dmg` & `.app` (kompatibel Intel & Apple Silicon).
- **Android:** `.apk` & `.aab` (kontrol lockscreen & audio service).
- **iOS:** `.ipa` (native audio pipeline).

---

## 2. Rekam Keputusan Arsitektur (Architectural Decision Records - ADR)

### ADR-001: Penghapusan Total LiveKit / WebRTC Social Rooms
- **Status:** `ACCEPTED & EXECUTED` (2026-09-10)
- **Konteks:** Perancangan awal memuat modul LiveKit SFU untuk ruang dengar bersama (*social room*) dan voice chat.
- **Keputusan:** Fitur LiveKit resmi dibatalkan dan dihapus sepenuhnya dari PRD, AGENTS, README, dan kode atas arahan langsung pemilik proyek (*Product Owner*) demi menjaga aplikasi tetap murni, fokus, dan ringan pada fidelitas pemutaran musik.

### ADR-002: Kedaulatan Sistem Playlist & Provider Agnosticism
- **Status:** `ACCEPTED & EXECUTED` (2026-09-10)
- **Konteks:** Terdapat bias awal yang memprioritaskan up-resolution hanya ke katalog TIDAL.
- **Keputusan:** Sistem diubah total menjadi netral (*provider-agnostic*). Pengguna bebas memilih penyedia pemutaran lagu (Spotify, YouTube Music, TIDAL, Lokal) per-lagu maupun secara global, dengan smart fallback otomatis.

### ADR-003: Core Engine Stack (Tauri v2 + Rust + React 19)
- **Status:** `ACCEPTED & EXECUTED` (2026-09-10)
- **Konteks:** Dibutuhkan performa audio kelas audiophile (bit-perfect, decoding PCM native), footprint memori kecil (< 150MB), dan dukungan cross-platform desktop & mobile.
- **Keputusan:** Menggunakan **Tauri v2** dengan backend **Rust** (`cpal` untuk routing hardware audio, `symphonia` untuk decoding FLAC/DSD/MP3) dan frontend **React 19 + TypeScript + Vite + Tailwind CSS v4**.

### ADR-004: Client-Side Zero-Knowledge Encrypted Vault
- **Status:** `ACCEPTED & EXECUTED` (2026-09-10)
- **Konteks:** Kredensial streaming pihak ketiga (token Spotify, sesi TIDAL) harus disinkronkan ke cloud tanpa risiko privasi atau kebocoran data.
- **Keputusan:** Menggunakan algoritma **AES-256-GCM** dengan salt unik dan kunci turunan **Argon2id**. Enkripsi terjadi secara lokal di perangkat klien sebelum dikirim ke server backend (Zero-Knowledge: server tidak dapat membaca plaintext).

---

## 3. Data Infrastruktur & Server Host

| Komponen | Nilai / Konfigurasi | Keterangan |
| :--- | :--- | :--- |
| **Server Host** | `vps-advin` | Virtual Private Server produksi backend |
| **Alamat IP Host** | `160.187.211.115:22` | Akses SSH Port 22 (user `root`) |
| **Direktori Server** | `/opt/wowserver` | Path kerja backend WowServer di VPS |
| **Sesi Orca-ADE** | `wowserver` (`ssh:ssh-1788975683526-yclzyw`) | Worktree terdaftar di Orca |
| **Fungsi Server** | WowCloud Backend | PostgreSQL, Auth SSO, Realtime Playlist Sync Hub, Encrypted Vault Storage |

---

## 4. Protokol Operasional & Aturan Mutlak AI Agent

1. **Wajib Plan Sebelum Eksekusi (Aturan Besi `AGENTS.md`)**:
   - Dilarang keras langsung mengedit file kode tanpa membuat rencana teknis (*step-by-step breakdown*) terlebih dahulu.
   - Wajib menunggu persetujuan eksplisit dari pengguna (*"Setuju"*, *"Lanjutkan"*, *"Oke Gass"*).
2. **Kualitas Kode & Verifikasi Sebelum Commit**:
   - `cargo check` dan `cargo clippy` harus lulus tanpa warning kritis.
   - Unit test Rust (ISRC matcher, Crypto Vault, Lyrics parser) wajib 100% pass.
   - `pnpm build` frontend harus lulus tanpa error kompilasi TypeScript.
   - Tidak ada token, password, atau file privat yang bocor ke git tracking.
3. **Format Commit**: Wajib menggunakan *Conventional Commits* (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

---

## 5. Status Verifikasi Baseline (Per 10 September 2026)

- **Scaffolding Proyek:** Tauri v2 + React 19 + Tailwind CSS v4 berhasil dikonfigurasi.
- **Unit Testing (Rust):**
  - `aggregator::tests::test_exact_isrc_matching` -> **PASS**
  - `aggregator::tests::test_fuzzy_metadata_matching_without_isrc` -> **PASS**
  - `lyrics::tests::test_parse_lrc_timestamps` -> **PASS**
  - `vault::tests::test_vault_encryption_decryption_cycle` -> **PASS**
  - `vault::tests::test_vault_wrong_password_fails` -> **PASS**
- **Git Commit Baseline:** [`dd415ad`](https://github.com/inimuqsith/WowMusicPlayer/commit/dd415ad) (di branch `main` & `inimuqsith/main`).

---

## 6. Riwayat Revisi Dokumen (Document Changelog)

| Versi | Tanggal | Penyusun | Ringkasan Perubahan |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-09-10 | Abdul Muqsith & Antigravity AI | Inisialisasi dokumen memori resmi proyek: rekam jejak ADR-001 s/d ADR-004, data host `vps-advin`, protokol agen, dan metadata profesional. |
