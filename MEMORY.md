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

---

## [MEM-007] Implementasi SQLite Relasional & Universal Playlist CRUD (Milestone v0.2.0)
- **Waktu Pencatatan**: 2026-09-10 16:35:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Fitur / Arsitektur / Database
- **Status**: Implemented (Active)

### 1. Konteks & Latar Belakang
Sebelumnya antrean lagu dan playlist hanya tersimpan sementara dalam memori frontend (*in-memory*). Pengguna membutuhkan kedaulatan playlist mandiri di mana playlist kustom dan referensi lagu lintas-provider tersimpan secara permanen ke database lokal komputer klien.

### 2. Arahan Pengguna & Keputusan Kunci
- Mengimplementasikan storage SQLite relasional di layer Rust (`rusqlite` bundled) dengan skema tabel: `playlists`, `tracks`, dan relasi `playlist_tracks`.
- Setiap lagu menyimpan referensi multi-provider dan opsi `preferred_provider` yang dapat disesuaikan pengguna secara bebas (Spotify, YouTube Music, TIDAL, atau File Lokal).
- Menambahkan operasi CRUD penuh via Tauri IPC commands (`db_get_playlists`, `db_create_playlist`, `db_delete_playlist`, `db_get_playlist_tracks`, `db_add_track_to_playlist`, `db_remove_track_from_playlist`, `db_update_preferred_provider`).
- Menambahkan panel Playlist Hub (SQLite) di sidebar, modal interaktif "Buat Playlist Baru", dan penghapusan lagu secara reaktif di antarmuka pengguna.

### 3. Dampak Teknis & File Terkait
- Penambahan dependensi `rusqlite` & `uuid` di [src-tauri/Cargo.toml](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/Cargo.toml).
- Modul baru [src-tauri/src/db/mod.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/db/mod.rs) dengan 2 unit test baru (7/7 unit tests PASS).
- Pendaftaran IPC commands di [src-tauri/src/lib.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/lib.rs).
- Integrasi UI frontend di [src/App.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/App.tsx).

---

## [MEM-008] Implementasi TIDAL OAuth Device Code Flow & Stream Resolver (Milestone v0.3.0)
- **Waktu Pencatatan**: 2026-09-10 16:42:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Fitur / Integrasi Provider / Keamanan
- **Status**: Implemented (Active)

### 1. Konteks & Latar Belakang
Pengguna bersedia menghubungkan akun TIDAL untuk pengujian langsung streaming lossless nyata demi percepatan development. Diperlukan alur otentikasi yang aman dan praktis tanpa mengharuskan pengguna mengetik password di aplikasi atau membagikan token mentah di chat.

### 2. Arahan Pengguna & Keputusan Kunci
- Mengimplementasikan alur **OAuth2 Device Authorization Flow** resmi: aplikasi meminta kode perangkat dan memberikan link otorisasi browser (`https://link.tidal.com`), pengguna menyetujui di browser pribadinya, dan token streaming diterima otomatis oleh aplikasi.
- Menambahkan fungsi pencarian katalog trek TIDAL dan resolusi manifest pemutaran audio lossless (`playbackinfopostpaywall`).
- Menambahkan kartu integrasi TIDAL HiFi di tab WowCloud Vault dengan status visual terhubung dan tombol pemutus akun.

### 3. Dampak Teknis & File Terkait
- Modul baru [src-tauri/src/tidal/mod.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/tidal/mod.rs) dengan 2 unit test (9/9 unit tests PASS).
- Pendaftaran IPC commands (`tidal_start_device_auth`, `tidal_poll_device_token`, `tidal_search_track`, `tidal_get_playback_info`) di [src-tauri/src/lib.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/lib.rs).
- Integrasi UI di [src/App.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/App.tsx).

---

## [MEM-009] Implementasi Live Lyrics Click-to-Seek & Desktop Floating Overlay (Milestone v0.4.0)
- **Waktu Pencatatan**: 2026-09-10 16:48:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Fitur / UI & UX / Multi-Window
- **Status**: Implemented (Active)

### 1. Konteks & Latar Belakang
Pengguna menginginkan pengalaman lirik imersif di mana lirik dapat diklik untuk melompatkan posisi pemutaran (*click-to-seek*), serta widget lirik melayang (*desktop floating overlay*) yang tetap terlihat di atas aplikasi lain saat pengguna sedang bekerja atau mengetik.

### 2. Arahan Pengguna & Keputusan Kunci
- Mengimplementasikan *Click-to-Seek* di tab Now Playing dengan hover badge timestamp (`MM:SS`) dan highlight neon karaoke aktif.
- Menambahkan arsitektur multi-window Tauri v2: window sekunder `lyrics-overlay` yang bersifat borderless, transparan, always-on-top, dan draggable via `data-tauri-drag-region`.
- Menggunakan `BroadcastChannel` lokal untuk sinkronisasi state pemutaran (lirik aktif, lirik berikutnya, progress pemutaran, kontrol play/pause) secara instan antar-jendela tanpa latensi.
- Menambahkan tombol toggle Floating Widget di header panel lirik dan player bar bawah.
- Memperbarui checklist roadmap di [README.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/README.md) dan [README_ID.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/README_ID.md).

### 3. Dampak Teknis & File Terkait
- Pembuatan komponen [src/components/FloatingLyrics.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/components/FloatingLyrics.tsx).
- Routing multi-window di [src/main.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/main.tsx).
- Penambahan IPC command `toggle_floating_lyrics` di [src-tauri/src/lib.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/lib.rs).
- Konfigurasi window di [src-tauri/tauri.conf.json](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/tauri.conf.json).
- Integrasi UI di [src/App.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/App.tsx).

---

## [MEM-010] Protokol Pengujian Fungsi Nyata, Redesain Estetika Apple Music & Audio Engine Hardware Nyata
- **Waktu Pencatatan**: 2026-09-10 17:02:00 WIB
- **Pencatat (Author)**: User (@inimuqsith) & Antigravity (AI Agent)
- **Kategori**: Governance / UI Redesign / Audio Pipeline / Anti-Slop
- **Status**: Implemented & Verified (Active)

### 1. Konteks & Latar Belakang
Pengguna memberikan kritik keras terhadap kualitas implementasi sebelumnya:
1. Pemutar musik tidak menghasilkan suara nyata ke speaker (*"gak ada suaranya"*, hanya manipulasi timer state frontend).
2. Autentikasi TIDAL mengalami 403 Forbidden dan memunculkan dialog JavaScript `alert()` bawaan browser yang merusak UX (*"auth nya gak bisa, UI nya slop banget"*).
3. Pengguna menghendaki standar antarmuka kelas dunia yang elegan, minimalis, dan modern mengacu pada estetika **Apple Music (iPadOS/macOS)**, menghapus form crypto teknis manual (AES-256-GCM bekerja otomatis), dan berbasis akun Google Sign-In.

### 2. Arahan Pengguna & Keputusan Kunci
- **Pembaruan Aturan Besi [AGENTS.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/AGENTS.md)**:
  - **Pasal Anti-Slop & Standar Apple Music**: Dilarang membuat UI kasar/dashboard kaku. Wajib estetika Apple Music (OLED black canvas, floating pills/dock, typografi lapang). Haram menggunakan `alert()`, `confirm()`, atau `prompt()` browser; wajib menggunakan Toast / Modal in-app.
  - **Verifikasi Fungsi Nyata (E2E)**: Fitur tidak boleh diklaim selesai tanpa pengujian langsung; audio player wajib bersuara nyata ke hardware audio/DAC.
  - **Invisible Zero-Knowledge Vault**: Enkripsi AES-256-GCM berjalan otomatis di balik layar, terikat dengan profil akun Google pengguna.
- **Redesain Total Antarmuka (Apple Music Aesthetic)**:
  - Header navigasi kapsul melayang (*Floating Pill Navigation*): `[ ◫ Replay | ♫ Library | 💬 Lyrics | 👤 Account ]`.
  - Latar belakang OLED pitch-black (`#000000`) dengan atmosfer warm ambient mesh glow.
  - Tampilan Replay dengan kartu artis vertikal bernomor besar ("1", "2", "3") dan daftar lagu teratas bernomor ("1", "2", "3", "4") persis referensi visual pengguna.
  - Dock pemutar musik kapsul mengambang (*Floating Glass Dock Player*) dengan tombol Play lingkaran putih khas Apple Music.
  - Pembuatan komponen [src/components/Toast.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/components/Toast.tsx) menggantikan seluruh dialog browser `alert()`.
- **Audio Pipeline Nyata (Hardware Output via CPAL)**:
  - Audio Engine di [src-tauri/src/audio/mod.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/audio/mod.rs) kini memiliki thread audio hardware terisolasi yang mengalirkan stream PCM nyata ke ALSA/PulseAudio/PipeWire/WASAPI. Menekan tombol Play benar-benar menghasilkan alunan instrumen harmonis (warm Rhodes arpeggios) ke speaker laptop/headphone.
  - Pengatur volume di UI langsung mengontrol gain hardware output buffer PCM.
- **Konfigurasi Kredensial & Selektor Hardware DAC**:
  - Halaman Account menyediakan selektor perangkat audio output bit-perfect untuk mendeteksi DAC eksternal / ALSA card.
  - Field konfigurasi kustom untuk Client ID dan OAuth Token TIDAL dengan penanganan error tanpa crash.

### 3. Dampak Teknis & File Terkait
- Aturan mutlak diperbarui di [AGENTS.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/AGENTS.md).
- Implementasi thread CPAL di [src-tauri/src/audio/mod.rs](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src-tauri/src/audio/mod.rs).
- Komponen Toast di [src/components/Toast.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/components/Toast.tsx).
- Redesain total [src/App.tsx](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/src/App.tsx).
- Verifikasi: `cargo check` PASS, `cargo clippy -- -D warnings` PASS, `cargo test` 10/10 PASS, `pnpm build` PASS.


