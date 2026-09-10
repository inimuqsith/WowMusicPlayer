# 📋 PLAN-004: Local Audio File Importer & Tag Metadata Reader

- **ID Plan**: PLAN-004
- **Status**: Draft
- **Kategori**: Audio Core & Local Storage
- **Target File**: 
  - `src-tauri/src/local/mod.rs`
  - `src-tauri/src/local/scanner.rs`
  - `src-tauri/src/main.rs`
  - `src/App.tsx`
  - `src/types.ts`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: -

---

### 1. Latar Belakang & Kebutuhan Fitur
Salah satu pilar utama WowMusicPlayer adalah **kebebasan sumber pemutaran (*Provider-Agnostic*)** yang mencakup koleksi file lokal pengguna.
Pengguna yang memiliki koleksi file audio lossless (FLAC, WAV, ALAC) atau lossy (MP3, AAC) di komputer mereka harus dapat:
1. Menambahkan file atau folder audio lokal ke perpustakaan WowMusicPlayer.
2. Membaca metadata tag ID3 / Vorbis Comments / MP4 tags (Judul, Artis, Album, Tahun, Track Number, Embedded Cover Art).
3. Memutar file lokal tersebut langsung melalui native audio engine Rust tanpa kompresi (*bit-perfect*).
4. Menyatukan track lokal ke dalam Universal Playlist bersama track online (Spotify, TIDAL, dsb.).

---

### 2. File yang Akan Dibuat / Dimodifikasi
- `src-tauri/Cargo.toml`: Menambahkan dependensi `id3`, `metaflac`, atau `lofty` untuk pembacaan tag audio berkecepatan tinggi.
- `src-tauri/src/local/scanner.rs`: Worker thread untuk memindai folder lokal, mengekstrak tag & embedded cover art, serta menyimpannya ke database cache SQLite.
- `src-tauri/src/main.rs`: Mendaftarkan Tauri commands: `open_local_file_dialog`, `scan_local_folder`, `get_local_library`.
- `src/App.tsx`: Tab atau tampilan "File Lokal" (*Local Files*), tombol "Buka File / Folder", dan integrasi drag-and-drop file audio.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Evaluasi Crate Metadata Rust**: Mengintegrasikan crate `lofty` yang mendukung format MP3, FLAC, OGG, WAV, ALAC, AAC, AIFF secara seragam.
2. **Implementasi Tauri File Dialog IPC**:
   - Menggunakan dialog native Tauri (`@tauri-apps/plugin-dialog`) untuk memilih satu/banyak berkas atau direktori musik.
3. **Penyimpanan Metadata & Cover Art**:
   - Ekstrak gambar sampul (*embedded cover*) menjadi data base64 atau cache thumbnail lokal.
   - Simpan entri file ke database internal `sqlite` untuk pencarian instan tanpa perlu rescan setiap kali aplikasi dibuka.
4. **Integrasi ke Playback Queue**:
   - Jika sumber track adalah `local`, alirkan langsung path absolut berkas ke `symphonia` decoder di Rust backend.
5. **Dukungan Web Fallback**:
   - Di web mode (`http://localhost:1420`), gunakan input HTML file `<input type="file" accept="audio/*">` dan `URL.createObjectURL(file)` agar tetap bisa diuji langsung di browser.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Memenuhi pilar kedaulatan universal playlist; pengguna tidak lagi bergantung 100% pada jaringan internet.
- **Dependensi Baru**: `lofty` pada Rust (`src-tauri/Cargo.toml`), `@tauri-apps/plugin-dialog`.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [ ] Berkas `.flac` dan `.mp3` lokal dapat dipilih dan diputar dengan suara jernih.
- [ ] Metadata nama lagu, artis, dan cover album terbaca akurat.
- [ ] Lagu lokal dapat dimasukkan ke antrean dan diatur posisinya.
- [ ] `cargo check` dan `pnpm build` lolos tanpa error.
- [ ] Catatan ditambahkan ke [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md).
