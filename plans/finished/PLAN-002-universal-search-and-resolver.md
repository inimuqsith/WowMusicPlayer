# 📋 PLAN-002: Universal Search & HiFi Stream Resolver

- **ID Plan**: PLAN-002
- **Status**: Finished
- **Kategori**: Streaming & Discovery
- **Target File**: 
  - `src/App.tsx`
  - `src-tauri/src/aggregator/mod.rs`
  - `src-tauri/src/aggregator/itunes.rs`
  - `src-tauri/src/streaming/mod.rs`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Aplikasi musik membutuhkan katalog lagu yang nyata, dinamis, dan dapat dicari secara instan oleh pengguna tanpa data dummy. Kebutuhan kunci:
1. Menghilangkan data dummy/hardcoded pada layar Beranda (*Home*) dan Pencarian (*Search*).
2. Membuka pencarian katalog global tanpa mewajibkan pengguna login terlebih dahulu.
3. Mengintegrasikan iTunes Search API sebagai katalog publik universal yang menyajikan cover art resolusi tinggi dan preview stream audio nyata (AAC 256kbps).
4. Menyediakan resolver multi-provider (TIDAL HiFi jika terhubung, fallback instan ke preview jika belum terhubung).

---

### 2. File yang Dibuat & Dimodifikasi
- `src-tauri/src/aggregator/itunes.rs`: Modul pencarian iTunes di backend Rust.
- `src-tauri/src/aggregator/mod.rs`: Definisi track universal dan ISRC aggregator.
- `src/App.tsx`:
  - Fitur Search bar real-time dengan debouncing.
  - Beranda dinamis dengan chart lagu terpopuler dunia yang diambil langsung saat aplikasi dibuka.
  - Integrasi preview stream 30 detik untuk pengguna yang belum menautkan akun berbayar.

---

### 3. Rincian Langkah Kerja yang Telah Dijalankan
1. Implementasi pemanggilan API publik iTunes Search (`https://itunes.apple.com/search?term=...&entity=song`) baik di sisi frontend maupun modul Rust.
2. Penambahan daftar lagu unggulan dunia (*Top Charts*) di Beranda secara otomatis saat halaman dimuat.
3. Normalisasi metadata lagu ke format antarmuka universal (`id`, `title`, `artist`, `album`, `coverUrl`, `duration`, `previewUrl`, `provider`).
4. Penyusunan alur fallback pemutaran: Jika TIDAL aktif, selesaikan stream lossless; jika belum ditautkan, putar preview audio asli secara hening tanpa menghambat user.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Pengguna dapat langsung menikmati musik dan mencari lagu apa saja detik pertama membuka aplikasi tanpa harus melakukan setup atau login yang rumit.
- **Dependensi Baru**: Akses network ke endpoint publik iTunes & Apple CDN untuk cover art berkualitas tinggi (`600x600`).

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [x] Fitur search menghasilkan lagu-lagu nyata dari seluruh dunia.
- [x] Musik berbunyi nyata saat lagu hasil pencarian ditekan Play.
- [x] Cover art tampil tajam dan berkualitas tinggi tanpa placeholder pecah.
- [x] Dicatat dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) entri `[MEM-007]` hingga `[MEM-011]`.
