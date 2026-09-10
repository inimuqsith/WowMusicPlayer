# 📋 PLAN-004: Expanded Now Playing Fullscreen & Bottom Bar Lyrics

- **ID Plan**: PLAN-004
- **Status**: Draft (Awaiting User Approval)
- **Kategori**: UI/UX & Player Navigation
- **Target File**: 
  - `src/App.tsx`
  - `plans/README.md`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: -

---

### 1. Latar Belakang & Kebutuhan Fitur
Sesuai arahan dan tinjauan langsung pengguna:
1. **Navigasi Tab Atas Terlalu Penuh**: Tab "Lirik" di navigation bar atas terasa canggung dan tidak sesuai kebiasaan aplikasi musik modern. Tab navigasi atas sebaiknya difokuskan untuk navigasi konten utama: **Beranda**, **Cari**, **Playlist**, dan **Akun**.
2. **Tombol Lirik di Play Bar Bawah**: Tombol lirik harus berada langsung di play bar (dock) bawah di samping scrubber & volume, sehingga pengguna dapat melihat lirik secara instan dari lagu apa pun yang sedang diputar tanpa berpindah tab konten.
3. **Klik Judul / Cover di Play Bar Membuka Mode Layar Penuh (Expanded Now Playing View)**:
   - Saat pengguna mengklik judul lagu, artis, atau icon/cover musik di play bar bawah, antarmuka bertransisi halus ke **Mode Penuh (Expanded Player / Full View)** ala Apple Music.
   - Mode penuh menampilkan:
     - Cover art beresolusi tinggi dengan ambient glow halus di latar belakang.
     - Informasi detail judul lagu & artis dalam tipografi tajam dan lapang.
     - Kontrol pemutaran lengkap: Shuffle, Previous, Play/Pause, Next, Repeat.
     - Scrubber timeline interaktif dengan durasi real-time.
     - Slider volume.
     - Toggle tampilan Lirik Waktu-Nyata (Time-Synced Lyrics) berdampingan atau fullscreen dengan auto-scroll.
     - Tombol minimize (chevron down) atau tombol escape untuk kembali ke tampilan katalog.

---

### 2. File yang Akan Dimodifikasi
- `src/App.tsx`:
  - **Navigasi Atas**: Hapus tombol tab "Lirik" dari center pill navigation bar (`activeTab` disederhanakan menjadi `"home" | "search" | "library" | "account"`).
  - **Play Bar (Dock Bawah)**:
    - Jadikan area info lagu (cover art + title + artist) sebagai tombol interaktif (*hover scale & pointer*) yang memicu `setIsExpandedPlayerOpen(true)`.
    - Pastikan tombol lirik di play bar (`<Mic2 />` atau `<MessageSquareQuote />`) aktif, mudah dijangkau, dan langsung membuka tampilan lirik di mode penuh.
  - **Komponen Expanded Now Playing (Full Screen Sheet)**:
    - Tambahkan state `isExpandedPlayerOpen: boolean` dan `expandedViewMode: "art" | "lyrics"`.
    - Tampilan fullscreen glassmorphic dengan latar belakang gelap pekat OLED (`#000000`) dan blur dinamis berbasis cover art.
    - Menampilkan lirik waktu nyata (synced lyrics LRCLIB) yang dapat diklik untuk seek ke menit tertentu.
    - Tombol tutup / collapse kembali ke dock bawah.
- `plans/README.md`:
  - Memperbarui tabel indeks draf untuk mencantumkan PLAN-004.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Pembersihan Navigasi Atas**:
   - Hapus tab `lyrics` dari pill navigation bar di header atas.
   - Pastikan navigasi hanya berisi: `Beranda`, `Cari`, `Playlist`, `Akun`.
2. **Interaktivitas Play Bar Bawah**:
   - Bungkus elemen cover art dan teks judul/artis pada play bar dengan event `onClick={() => setIsExpandedPlayerOpen(true)}` dengan cursor pointer dan efek hover halus.
   - Perbarui tombol lirik di play bar: saat diklik, langsung membuka Expanded Player dalam mode lirik (`expandedViewMode = "lyrics"`).
3. **Pembuatan Tampilan Expanded Now Playing View**:
   - Buat overlay layar penuh dengan animasi transisi naik (*slide-up / fade-in*).
   - Sisi kiri/tengah: Artwork album besar dengan bayangan halus, atau toggle berganti ke daftar lirik real-time yang tersinkronisasi.
   - Sisi kanan (layar lebar): Teks lirik dinamis LRCLIB yang auto-scroll mengikuti detik lagu berjalan, dengan baris aktif yang bercahaya terang (active glow) dan baris lain redup.
   - Tombol kontrol pemutaran utama yang mudah disentuh/diklik.
   - Tombol collapse di pojok kiri/kanan atas untuk menutup overlay dan kembali ke halaman katalog tanpa menghentikan lagu.
4. **Verifikasi & Pengujian Responsif**:
   - Uji klik cover/judul di play bar -> pastikan mode penuh terbuka mulus.
   - Uji klik tombol lirik di play bar -> pastikan langsung menampilkan lirik lagu aktif.
   - Uji tombol minimize/close -> pastikan kembali ke halaman beranda/search dengan musik tetap berbunyi tanpa jeda.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Pengalaman Pengguna (UX)**: Standar pengalaman konsumer meningkat tajam setara Apple Music / Spotify Desktop. Navigasi atas menjadi jauh lebih bersih dan tidak membingungkan.
- **Dependensi Baru**: Tidak ada dependensi baru (menggunakan Lucide icons yang sudah ada: `ChevronDown`, `Mic2`, `Maximize2`, `Minimize2`, dsb., serta Tailwind CSS).

---

### 5. Kriteria Penerimaan & Verifikasi Nyata (Acceptance Criteria)
- [ ] Tab "Lirik" tidak ada lagi di bar navigasi atas.
- [ ] Mengklik icon cover atau judul lagu di play bar bawah langsung membuka mode Expanded Player layar penuh.
- [ ] Mengklik icon lirik di play bar bawah langsung menampilkan lirik lagu yang sedang diputar.
- [ ] Mode layar penuh memiliki tombol tutup / kembali ke tampilan sebelumnya dengan mulus.
- [ ] Musik terus berputar secara kontinyu tanpa stuttering saat membuka atau menutup mode penuh.
- [ ] Build `pnpm build` dan `cargo check` lulus 100% tanpa error atau warning.
