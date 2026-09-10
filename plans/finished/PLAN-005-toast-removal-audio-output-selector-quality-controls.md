# 📋 PLAN-005: Eliminasi Pop-Up, Perbaikan Scroll, Kualitas Audio & Output Selector dengan Exclusive Mode

- **ID Plan**: PLAN-005
- **Status**: Finished
- **Kategori**: UI/UX & Audio Hardware Control
- **Target File**: 
  - `src/App.css`
  - `src/App.tsx`
  - `plans/README.md`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Berdasarkan arahan dan bukti visual pengguna:
1. **Hapus Seluruh Pop-Up / Toast Notifikasi**:
   - Pencarian lagu menghasilkan spam toast (*"Ditemukan 25 lagu untuk 'Queen'"*, dsb.) yang sangat mengganggu.
   - Seluruh pop-up toast yang tidak penting saat pencarian, penambahan lagu, atau navigasi harus dihapus total. Antarmuka harus hening (*silent & unobtrusive*) layaknya Apple Music / Spotify.
2. **Perbaikan Masalah Scroll**:
   - Di `src/App.css`, properti `body { overflow: hidden; }` mengunci scrollbar browser sehingga halaman utama dan daftar katalog terpotong dan tidak bisa di-scroll ke bawah.
   - Di dalam mode Expanded Player, `flex flex-col justify-center` pada container scrollable lirik memotong konten bagian atas pada layar vertikal pendek.
   - Diperlukan perbaikan arsitektur scroll agar halaman utama, daftar playlist, dan lirik dapat digulir dengan mulus (*smooth scrolling*).
3. **Indikator Kualitas Audio yang Aktif**:
   - Di play bar (dock bawah) dan mode layar penuh, tampilkan badge kualitas audio yang sedang diputar (misal: `Hi-Res Lossless 24-bit/96kHz`, `Lossless 16-bit/44.1kHz`, atau `AAC 256kbps`).
4. **Selector Output Audio di Playbar dengan Slider / Switch "Exclusive Mode"**:
   - Menambahkan tombol selector output audio di dock bawah (icon Speaker / Output).
   - Membuka popover modern untuk:
     - Memilih perangkat output audio (Speaker Bawaan, Headphone 3.5mm, USB DAC Eksternal).
     - Switch / slider toggle **Exclusive Mode (Modus Eksklusif)** dengan keterangan jelas: *"Bit-Perfect Passthrough: melewatkan mixer OS langsung ke DAC untuk kualitas audio murni tanpa penurunan resolusi."*
5. **Selector Kualitas Audio di Menu Pengaturan / Akun**:
   - Menambahkan selector pilihan kualitas streaming/audio di tab Pengaturan:
     - `Hi-Res Lossless (FLAC hingga 24-bit / 192kHz)`
     - `Lossless CD Quality (FLAC 16-bit / 44.1kHz)`
     - `Tinggi (AAC 256kbps)`
     - `Normal (AAC 160kbps)`
     - `Hemat Data (96kbps)`
   - Menyimpan preferensi secara persisten di `localStorage`.

---

### 2. File yang Akan Dimodifikasi
- `src/App.css`:
  - Perbaiki `body`: ganti `overflow: hidden;` dengan `overflow-x: hidden; overflow-y: auto;`.
  - Pastikan custom scrollbar tampil konsisten dan mulus di seluruh browser dan desktop.
- `src/App.tsx`:
  - **Hapus Toast Spam**: Hapus seluruh `showToast` pada search results, filter, dan aksi umum.
  - **Perbaikan Scroll**: Perbaiki container utama dan perbaiki scroll container lirik di Expanded Player (`justify-start` bukan `justify-center` yang merusak scroll).
  - **Indikator Kualitas**: Tampilkan badge kualitas audio di play bar dan Expanded Player.
  - **Selector Output & Exclusive Mode Popover**:
    - Tambahkan state `isOutputMenuOpen`, `selectedOutputDevice`, `isExclusiveMode`.
    - Tambahkan trigger button di dock bawah dan popover glassmorphic dengan daftar device output & slider switch **Exclusive Mode**.
  - **Selector Kualitas di Pengaturan**:
    - Tambahkan dropdown / radio card selector kualitas audio di tab Akun/Pengaturan.
- `plans/README.md`:
  - Catat PLAN-005 dalam tabel indeks draf.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Fix Layout & Global Scrolling (`src/App.css` & `src/App.tsx`)**:
   - Ubah `overflow: hidden;` pada `body` menjadi `overflow-y: auto; overflow-x: hidden;`.
   - Pastikan tinggi container utama dan padding bawah `pb-36` memberi ruang lapang agar dock tidak menutupi item lagu terbawah.
2. **Pembersihan Total Pop-Up / Toasts (`src/App.tsx`)**:
   - Hapus pemanggilan `showToast` di fungsi `handleSearch` dan debounced search.
   - Hapus toast saat menambah lagu ke playlist dan saat switch tab.
   - Sembunyikan `<ToastContainer />` dari alur interaksi biasa agar tidak ada banner yang muncul di atas layar.
3. **Komponen Selector Output Audio & Exclusive Mode**:
   - Tambahkan state perangkat audio: default system speaker, headphones, external DAC.
   - Tambahkan state boolean `isExclusiveMode` (tersimpan di `localStorage`).
   - Buat popover elegan yang muncul di atas dock saat tombol output diklik:
     - Pilihan perangkat output.
     - Switch slider toggle "Exclusive Mode" dengan deskripsi bit-perfect passthrough.
4. **Indikator Kualitas Audio di Playbar & Expanded Player**:
   - Hubungkan state kualitas preset (`Hi-Res Lossless`, `Lossless`, `AAC 256kbps`) ke badge subtle di dock samping judul lagu dan di Expanded Player.
5. **Selector Kualitas Audio di Pengaturan**:
   - Di tab Pengaturan/Akun, buat bagian "Kualitas Audio & Perangkat" yang memungkinkan memilih resolusi audio dan mengaktifkan mode eksklusif.

---

### 4. Analisis Dampak & Dependensi
- **Dampak UX**: Aplikasi menjadi hening, bersih, tidak ada spam pop-up. Scrolling terasa responsif dan normal di semua browser dan monitor. Kontrol audiophile (Exclusive Mode & Quality Selector) memberikan nilai profesional sekelas Roon / Audirvana / Tidal Desktop.
- **Dependensi Baru**: Tidak ada dependensi baru (menggunakan Lucide icons yang sudah ada: `Speaker`, `Sliders`, `Check`, `Settings2`, dsb.).

---

### 5. Kriteria Penerimaan & Verifikasi Nyata (Acceptance Criteria)
- [x] Tidak ada lagi pop-up atau toast banner yang muncul saat mencari lagu atau berinteraksi.
- [x] Halaman utama, hasil pencarian, dan playlist dapat di-scroll ke atas dan bawah dengan normal dan lancar.
- [x] Di play bar terdapat badge kualitas audio yang sedang diputar.
- [x] Di play bar terdapat tombol selector output audio yang menampilkan daftar perangkat dan slider switch "Exclusive Mode".
- [x] Di tab Pengaturan terdapat selector kualitas audio yang tersimpan secara persisten.
- [x] Kompilasi `pnpm build` dan `cargo check` lulus 100% tanpa error.
