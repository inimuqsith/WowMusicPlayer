# 🧠 WowMusicPlayer - Project Memory & Decision Log

Dokumen ini adalah **catatan memori kronologis (*append-only*)** yang merekam setiap peristiwa penting, arahan pengguna, keputusan arsitektur, koreksi visi, dan perubahan tata kelola pada proyek **WowMusicPlayer**.

Setiap entri memori wajib menggunakan format header standar yang telah ditentukan di bawah ini agar riwayat proyek terdokumentasi secara transparan, akurat, dan profesional.

---

## 📌 Standar Format Header Entri Memori

Setiap penambahan memori baru WAJIB ditambahkan di bagian bawah (*append-only*) dengan format berikut:

```markdown
---

## [MEM-XXX] <Judul Singkat Peristiwa / Keputusan>
- **Waktu Pencatatan**: YYYY-MM-DD HH:MM:SS WIB
- **Pencatat (Author)**: Antigravity (AI Agent) / User (@inimuqsith) / Developer
- **Kategori**: [Arsitektur | Governance | Fitur | Revisi Visi | Infrastruktur | Bugfix]
- **Status**: [Active | Implemented | Superseded]

### 1. Konteks & Latar Belakang
Penjelasan mengenai latar belakang masalah, kebutuhan baru, atau peristiwa yang memicu pencatatan ini.

### 2. Arahan Pengguna & Keputusan Kunci
Poin-poin spesifik instruksi pengguna dan keputusan mutlak yang disepakati bersama.

### 3. Dampak Teknis & File Terkait
Daftar berkas yang terpengaruh, trade-off arsitektur, dan referensi commit terkait.
```

---

## 📜 Rekaman Kronologis Memori Proyek

---

## [MEM-001] Pembatalan Fitur LiveKit Voice/Room Chat & Re-fokus ke Universal Audio Player
- **Waktu Pencatatan**: 2026-09-10 14:15:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Revisi Visi / Arsitektur
- **Status**: Implemented (Active)

### 1. Konteks & Latar Belakang
Repositori awal berada di bawah direktori `LiveKit/WowMusicPlayer` dengan konfigurasi awal yang menyertakan room audio/voice conferencing LiveKit.

### 2. Arahan Pengguna & Keputusan Kunci
- Pengguna menegaskan bahwa **WowMusicPlayer adalah pemutar musik mandiri tingkat tinggi**, bukan aplikasi voice room atau conferencing.
- Seluruh dependensi, arsitektur server, dan modul yang berkaitan dengan LiveKit room chat dibatalkan secara permanen (ADR-001).
- Fokus dialihkan penuh ke pembangunan native audio engine menggunakan Rust (`cpal`, `symphonia`, `rodio`) untuk output bit-perfect ke DAC eksternal.

### 3. Dampak Teknis & File Terkait
- Dihapusnya rencana implementasi LiveKit WebRTC server.
- File terkait: [ARCHITECTURE.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/ARCHITECTURE.md), [PRD.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/PRD.md), [src-tauri/Cargo.toml](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/Cargo.toml).

---

## [MEM-002] Penegasan Universal Playlist Hub Mandiri & Prinsip Provider-Agnostic
- **Waktu Pencatatan**: 2026-09-10 15:05:22 WIB
- **Pencatat (Author)**: User (@inimuqsith)
- **Kategori**: Revisi Visi / Core Philosophy
- **Status**: Active

### 1. Konteks & Latar Belakang
Pada draft dokumentasi awal, terdapat kalimat yang menyiratkan prioritas sepihak: *"Aggregate your fragmented playlists from Spotify, YouTube Music, and Apple Music into high-resolution TIDAL Lossless playback"*. Hal ini menimbulkan distorsi filosofi produk.

### 2. Arahan Pengguna & Keputusan Kunci
- Pengguna memberikan koreksi tegas: **Inti utama WowMusicPlayer adalah membangun SISTEM PLAYLIST SENDIRI (Universal Playlist Hub)**.
- Pengguna memiliki kedaulatan mutlak (*Provider-Agnostic*): bebas memilih sumber audio pemutaran, apakah ingin memutar via **Spotify, YouTube Music, Apple Music, TIDAL, maupun File Lokal**, tanpa mengutamakan atau mengunci ke TIDAL semata.
- Metadata lagu wajib menyimpan referensi silang multi-provider (Spotify Track ID, YouTube Video ID, TIDAL Track ID, ISRC, dan local file path).

### 3. Dampak Teknis & File Terkait
- Revisi total narasi [PRD.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/PRD.md), [README.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/README.md), [README_ID.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/README_ID.md), dan [ARCHITECTURE.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/ARCHITECTURE.md).
- Implementasi selector provider langsung pada UI Playlist di [src/App.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/App.tsx).

---

## [MEM-003] Klarifikasi Bentuk Rilis Multiplatform — Native Standalone Application
- **Waktu Pencatatan**: 2026-09-10 15:20:10 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Arsitektur / Target Platform
- **Status**: Active

### 1. Konteks & Latar Belakang
Pengguna mengajukan pertanyaan klarifikasi mengenai bentuk akhir dari target fase rilis multiplatform (Linux, Windows, macOS, Android, iOS).

### 2. Arahan Pengguna & Keputusan Kunci
- WowMusicPlayer dipastikan berwujud **Aplikasi Mandiri (Native Standalone Application)** yang di-install di sistem operasi pengguna, **BUKAN web player di browser**.
- Target paket instalasi:
  - **Linux**: `.AppImage`, `.deb`
  - **Windows**: `.exe` / `.msi`
  - **macOS**: `.dmg`
  - **Android**: `.apk`
  - **iOS**: `.ipa`
- Memanfaatkan arsitektur **Tauri v2** yang mendukung kompilasi desktop dan mobile secara native dengan konsumsi RAM yang sangat efisien dibanding Electron.

### 3. Dampak Teknis & File Terkait
- Pengaturan konfigurasi Tauri v2 di [src-tauri/tauri.conf.json](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/tauri.conf.json).
- Dokumentasi di [PRD.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/PRD.md) section Platform Releases.

---

## [MEM-004] Penetapan Protokol Besi Tata Kelola AI Agent di AGENTS.md
- **Waktu Pencatatan**: 2026-09-10 15:45:00 WIB
- **Pencatat (Author)**: User (@inimuqsith)
- **Kategori**: Governance / AI Protocol
- **Status**: Active (Mutlak Wajib Dipatuhi)

### 1. Konteks & Latar Belakang
Terdapat kecenderungan AI agent melakukan modifikasi kode secara terburu-buru atau membuat asumsi sendiri tanpa mengonfirmasi arah strategi pengguna terlebih dahulu (*"sok paham"*).

### 2. Arahan Pengguna & Keputusan Kunci
- Diberlakukan aturan besi mutlak di [AGENTS.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/AGENTS.md):
  1. **WAJIB Membuat Plan Implementasi Terlebih Dahulu** sebelum menulis kode atau mengubah file.
  2. **WAJIB Menunggu Peninjauan & Persetujuan Eksplisit dari Pengguna** (misal: *"Setuju"*, *"Lanjutkan"*, *"Oke Gass"*).
  3. **DILARANG KERAS** menyentuh file kode atau melakukan eksekusi sebelum ada izin eksplisit pengguna.
  4. Eksekusi dilakukan secara terkendali dan disiplin mengikuti poin-poin yang disetujui.

### 3. Dampak Teknis & File Terkait
- Pembuatan dan penguncian aturan pada [AGENTS.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/AGENTS.md).
- Menjadi aturan sistem yang aktif di prompt agent dan developer guidelines.

---

## [MEM-005] Integrasi Cloud WowServer di VPS vps-advin untuk Vault & Handoff
- **Waktu Pencatatan**: 2026-09-10 16:00:30 WIB
- **Pencatat (Author)**: User (@inimuqsith)
- **Kategori**: Infrastruktur / Cloud Sync
- **Status**: Active

### 1. Konteks & Latar Belakang
Kebutuhan akan sinkronisasi playlist lintas perangkat, transfer playback (*Cross-Device Handoff*), serta penyimpanan *Encrypted Vault* akun pengguna.

### 2. Arahan Pengguna & Keputusan Kunci
- Pengguna telah menyiapkan server VPS `vps-advin` (`160.187.211.115`, user `root`) pada path `/opt/wowserver` yang terhubung via sesi Orca `/orchestration` (`wowserver`).
- Arsitektur sinkronisasi mengadopsi prinsip *Zero-Knowledge Client-Side Encryption*: kredensial dan token OAuth dienkripsi di sisi klien dengan **AES-256-GCM + Argon2id** sebelum dikirim ke WowServer. Server hanya menyimpan *blind ciphertext*.

### 3. Dampak Teknis & File Terkait
- Modul enkripsi Rust di [src-tauri/src/vault/mod.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/vault/mod.rs).
- Dokumentasi di [ARCHITECTURE.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/ARCHITECTURE.md) dan [SECURITY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/SECURITY.md).

---

## [MEM-006] Standarisasi Format Append-Only Log MEMORY.md dengan Header Baku
- **Waktu Pencatatan**: 2026-09-10 16:30:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Governance / Dokumentasi
- **Status**: Implemented (Active)

### 1. Konteks & Latar Belakang
Format awal dokumen memori disajikan sebagai ringkasan umum tanpa header per-entri yang jelas. Pengguna mengoreksi bahwa setiap memori wajib memiliki header terstruktur lengkap yang mencatat waktu, pembuat (*author*), dan detail konteks secara profesional.

### 2. Arahan Pengguna & Keputusan Kunci
- Ditetapkan format header baku per-entri `[MEM-XXX]` yang memuat:
  - Waktu Pencatatan (timestamp lengkap dengan zona waktu WIB).
  - Pencatat (Author).
  - Kategori dan Status.
  - Tiga sub-bab inti: Konteks & Latar Belakang, Arahan Pengguna & Keputusan Kunci, serta Dampak Teknis & File Terkait.
- Menjadikan [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) dokumen kronologis yang terus di-append setiap kali ada keputusan/fitur baru.

### 3. Dampak Teknis & File Terkait
- Pembaruan total berkas [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) dengan rekonstruksi entri `[MEM-001]` sampai `[MEM-006]`.

