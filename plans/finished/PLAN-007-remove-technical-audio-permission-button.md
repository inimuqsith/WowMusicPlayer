# 📋 PLAN-007: Eliminasi Tombol Izin Teknis & Pembersihan Menu Keluaran Audio (Zero-Jargon Apple Music Standard)

- **ID Plan**: PLAN-007
- **Status**: Finished
- **Kategori**: UI/UX & Consumer Polish
- **Target File**: 
  - `src/App.tsx`
  - `plans/README.md`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Pengguna menanyakan tombol *"Deteksi Nama Hardware Fisik (Izinkan Akses)"* di dalam menu popover Keluaran Audio (*"apa ini ?"*).
- **Akar Masalah**:
  - Tombol tersebut sebelumnya dipasang untuk memicu izin media Web Audio browser agar label perangkat fisik asli terbuka.
  - Namun tombol tersebut **melanggar standar Zero-Slop Consumer UX & Apple Music Design Principles** di `AGENTS.md`:
    - Menggunakan jargon teknis developer (*"Deteksi Nama Hardware Fisik (Izinkan Akses)"*).
    - Membebani pengguna biasa dengan tombol permintaan izin yang tampak seperti menu troubleshooting / developer settings di dalam popover pemutar musik.
- **Kebutuhan**:
  - Hapus 100% tombol tersebut dari tampilan popover Keluaran Audio.
  - Deteksi hardware audio berjalan hening (*silent & invisible*) di latar belakang:
    - Di Desktop (Tauri): Membaca sink PipeWire/ALSA secara langsung via `cpal`.
    - Di Browser: Membaca `enumerateDevices()`; jika label dibatasi oleh browser, tampilkan copywriting konsumer bersih dan ramah (*"Speaker Laptop / Default Sistem"*, *"Headphone / Audio Jack"*).
  - Tampilan popover Keluaran Audio menjadi sangat bersih, minimalis, dan elegan.

---

### 2. File yang Akan Dibuat / Dimodifikasi
- `src/App.tsx`:
  - Hapus blok tombol *"Deteksi Nama Hardware Fisik (Izinkan Akses)"*.
  - Sederhanakan fallback labeling agar selalu menggunakan copywriting konsumer elegan.
  - Jaga agar daftar perangkat dan slider Exclusive Mode tertata rapi tanpa elemen asing.
- `plans/README.md`:
  - Catat PLAN-007 di tabel draf dan kelola status perjalanannya.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Penghapusan Elemen UI Teknis (`src/App.tsx`)**:
   - Hapus JSX blok tombol pemicu izin di dalam popover Keluaran Audio.
   - Bersihkan parameter perizinan teknis yang tidak perlu ditampilkan ke pengguna.
2. **Refactor Labeling Ramah Konsumer**:
   - Pastikan fallback nama perangkat selalu ramah konsumer jika browser mengembalikan string label kosong:
     - Output default -> *"Speaker Utama / Sistem Default"* (ALSA / PipeWire / CoreAudio).
     - Output non-default -> *"Keluaran Audio Eksternal"*.
3. **Verifikasi Tampilan & Build**:
   - Jalankan `pnpm build` untuk memastikan tidak ada error TypeScript/bundling.
   - Ambil screenshot antarmuka headless browser untuk memverifikasi popover Keluaran Audio tampil bersih, minimalis, dan elegan tanpa tombol teknis.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Estetika**: Antarmuka kembali ke standar kemewahan Apple Music (OLED black, typography tajam, zero developer jargon).
- **Dampak Fungsional**: Pengalihan sink audio dan slider Exclusive Mode tetap berfungsi 100% tanpa gangguan.
- **Dependensi Baru**: Tidak ada.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata (Acceptance Criteria)
- [x] Tombol *"Deteksi Nama Hardware Fisik (Izinkan Akses)"* hilang 100% dari popover Keluaran Audio.
- [x] Popover hanya menampilkan header, daftar sink audio fisik yang bersih, dan slider toggle Exclusive Mode.
- [x] Pengalihan perangkat audio dan toggle Exclusive Mode tetap berfungsi sempurna.
- [x] `pnpm build` dan `cargo check` lulus 100% tanpa error atau warning.
