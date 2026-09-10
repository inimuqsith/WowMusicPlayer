# 📋 PLAN-003: Consumer UI Polish, Zero-Friction & Real LRCLIB

- **ID Plan**: PLAN-003
- **Status**: Finished
- **Kategori**: UI/UX & Lyrics Engine
- **Target File**: 
  - `src/App.tsx`
  - `src/index.css`
  - `AGENTS.md`
  - `.agents/skills/wowmusic-core/SKILL.md`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Berdasarkan tinjauan pengalaman pengguna (*consumer grade UX review*), aplikasi masih memiliki sejumlah hambatan dan inkonsistensi estetika:
1. Pemutaran lagu memunculkan modal pop-up dan spam notifikasi toast (*"Memutar lagu..."*, *"Mencari stream..."*) yang mengganggu kenyamanan.
2. Munculnya jargon teknis developer di antarmuka konsumer (*"Musik Asli Tanpa Batas"*, *"LRCLIB (Time-Synced)"*, *"Connected to VPS"*).
3. Halaman lirik menampilkan lirik palsu/statis (*Bohemian Rhapsody*) saat lagu yang diputar bukan lagu Queen.
4. Diperlukan standarisasi absolut bahwa WowMusicPlayer adalah pemutar musik kelas dunia dengan estetika Apple Music / Hi-Fi OLED hitam pekat.

---

### 2. File yang Dibuat & Dimodifikasi
- `src/App.tsx`:
  - Menghapus seluruh modal pemblokir pemutaran (`isLinkModalOpen`) dan menghapus seluruh spam toast playback.
  - Mengintegrasikan LRCLIB fetcher langsung dengan parser timestamp LRC `[mm:ss.xx]`.
  - Mengubah fallback lirik menjadi empty-state bersih: *"Lirik belum tersedia untuk lagu ini"*.
  - Menghapus semua developer jargon; menggantinya dengan copywriting konsumer elegan.
- `AGENTS.md`: Menambahkan pasal larangan alert/modal/toast spam dan larangan developer jargon.
- `.agents/skills/wowmusic-core/SKILL.md`: Membuat panduan skill baru untuk prinsip audio nyata dan UI konsumer.

---

### 3. Rincian Langkah Kerja yang Telah Dijalankan
1. Refactor fungsi `playTrackAt` di `src/App.tsx` agar pemutaran berjalan instan dan hening tanpa dialog atau pop-up.
2. Pembuatan fungsi parser `parseLrc` dan fetching dinamis ke `https://lrclib.net/api/get?artist_name=...&track_name=...` dengan normalisasi judul lagu.
3. Pembersihan copywriting: Beranda menggunakan *"Dengarkan Musik Favorit"*, tab lirik menggunakan judul *"Lirik"*.
4. Perapian badge audio dock: Hanya menampilkan indikator subtle `TIDAL HiFi` saat stream TIDAL aktif.
5. Verifikasi pengujian di web browser `http://localhost:1420/`.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Pengalaman pengguna meningkat drastis menjadi mulus, elegan, dan sekelas aplikasi musik komersial premium (Apple Music).
- **Dependensi Baru**: Integrasi browser client-side ke public LRCLIB API dengan CORS header terbuka.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [x] Tombol Play memutar musik secara instan tanpa ada pop-up modal atau spam toast.
- [x] Lirik diambil secara dinamis dari LRCLIB sesuai lagu dan artis yang sedang diputar.
- [x] Tidak ada lagi jargon teknis developer di seluruh antarmuka.
- [x] Kompilasi `pnpm build` dan `cargo check` lulus tanpa error.
- [x] Dicatat dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) entri `[MEM-013]` dan `[MEM-014]`.
