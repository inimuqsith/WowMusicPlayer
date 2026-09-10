# 📋 PLAN-006: Deteksi Perangkat Keras Audio Nyata & Switching Sink Eksklusif (Anti-Gimmick)

- **ID Plan**: PLAN-006
- **Status**: Finished
- **Kategori**: Audio Core & Hardware Integration
- **Target File**: 
  - `src-tauri/src/audio/mod.rs`
  - `src-tauri/src/lib.rs`
  - `src/App.tsx`
  - `plans/README.md`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: 2026-09-10

---

### 1. Latar Belakang & Kebutuhan Fitur
Pengguna mengevaluasi menu keluaran audio dengan keras (*"kok gini keluarkan audionya, bukan device, dan GIMIKKK"*):
- Tampilan sebelumnya menggunakan 3 item statis/hardcoded (*"Speaker Utama"*, *"Headphone / Jack Audio"*, *"USB DAC / Audio Interface"*). Ini adalah data palsu (dummy gimmick) yang tidak mencerminkan perangkat fisik nyata pengguna.
- Diperlukan implementasi **deteksi perangkat keras audio nyata (*real hardware device enumeration*)**:
  1. **Di Lingkungan Web Browser**:
     - Menggunakan Web Audio / MediaDevices API (`navigator.mediaDevices.enumerateDevices()` dengan filter `kind === 'audiooutput'`).
     - Menyediakan tombol pemindaian perangkat / izin mikrofon-speaker agar label perangkat fisik asli (seperti nama chip soundcard, headphones, atau USB DAC eksternal) terbaca nyata dari sistem operasi.
     - Melakukan pengalihan keluaran suara secara nyata menggunakan `HTMLAudioElement.setSinkId(deviceId)`.
  2. **Di Lingkungan Desktop Tauri / Rust**:
     - Menggunakan backend Rust `cpal::default_host().output_devices()` untuk membaca seluruh sink PipeWire / ALSA / WASAPI / CoreAudio nyata di laptop/PC pengguna.
     - Menyediakan Tauri command `get_audio_devices` dan `set_audio_output_device(device_name, exclusive_mode)`.
  3. **Exclusive Mode (Modus Eksklusif Nyata)**:
     - Menghubungkan switch Exclusive Mode ke konfigurasi sink hardware langsung.
     - Di Rust: Mengalirkan sampel PCM bit-perfect langsung ke hardware tanpa resampling mixer OS.
     - Menampilkan indikator teknis nyata (Sample Rate misal `48000 Hz`, Jumlah Channel `2ch`, Status `Bit-Perfect`).

---

### 2. File yang Akan Dibuat / Dimodifikasi
- `src-tauri/src/audio/mod.rs`:
  - Tambahkan fungsi `set_device(&self, device_name: &str, exclusive: bool)` pada `AudioEngine`.
  - Dukungan pemilihan device output cpal secara dinamis.
- `src-tauri/src/lib.rs`:
  - Tambahkan Tauri command `set_audio_device(state, device_name: String, exclusive: bool)`.
  - Daftarkan command ke invoke handler Tauri.
- `src/App.tsx`:
  - Hapus daftar statis `AUDIO_OUTPUT_DEVICES`.
  - Buat hook / effect untuk mendeteksi perangkat output nyata:
    - Jika Tauri aktif: panggil `invoke<AudioDeviceInfo[]>("get_audio_devices")`.
    - Jika di browser: panggil `navigator.mediaDevices.enumerateDevices()` dan tangani izin perangkat via `navigator.mediaDevices.getUserMedia({ audio: true })`.
  - Hubungkan pemilihan perangkat ke `audioRef.current.setSinkId(deviceId)` dan IPC Rust.
  - Tampilkan nama perangkat fisik asli beserta detail spesifikasi teknisnya (Sample Rate & Channel).
- `plans/README.md`:
  - Tambahkan PLAN-006 ke indeks draf.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Pembersihan Data Statis Gimmick (`src/App.tsx`)**:
   - Hapus array hardcoded `AUDIO_OUTPUT_DEVICES`.
   - Buat tipe state dinamis `realAudioDevices: RealAudioDevice[]`.
2. **Implementasi Deteksi Perangkat Nyata (Web & Tauri)**:
   - Buat fungsi `refreshAudioDevices()` yang otomatis berjalan saat popover Keluaran Audio dibuka.
   - Pindai `navigator.mediaDevices.enumerateDevices()`.
   - Jika label perangkat masih kosong (karena kebijakan keamanan browser belum ada izin media), sediakan tombol elegan: *"Pindai Perangkat Keras Nyata (Klik untuk Akses)"* yang memanggil audio permission dan langsung memunculkan nama perangkat fisik laptop pengguna.
   - Panggil `invoke("get_audio_devices")` jika di lingkungan desktop.
3. **Pengalihan Suara Nyata (Real Sink Switching)**:
   - Saat pengguna memilih salah satu perangkat fisik dari daftar, jalankan `audioRef.current.setSinkId(device.id)` sehingga audio benar-benar berpindah ke output tersebut.
   - Simpan `deviceId` terpilih ke `localStorage`.
4. **Integrasi Exclusive Mode**:
   - Hubungkan toggle switch Exclusive Mode dengan pengiriman parameter ke Rust backend jika di desktop.
   - Perbarui badge status menjadi *Bit-Perfect Direct Hardware Passthrough*.
5. **Verifikasi & Pengujian**:
   - Buka menu Keluaran Audio di browser dan verifikasi bahwa nama perangkat yang muncul adalah soundcard/speaker fisik pengguna (PipeWire / ALSA / Realtek).
   - Uji klik tombol ganti device -> pastikan suara tetap mengalir ke sink yang dipilih.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Mengeliminasi 100% data dummy/gimmick. Aplikasi WowMusicPlayer menjadi pemutar audio nyata berstandar audiophile yang terhubung langsung ke hardware audio pengguna.
- **Dependensi Baru**: Web Audio MediaDevices API standar & CPAL host device iterator.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata (Acceptance Criteria)
- [x] Daftar perangkat di menu Keluaran Audio 100% memuat nama soundcard / sink fisik nyata sistem pengguna (bukan hardcoded dummy).
- [x] Tersedia tombol pemicu deteksi izin browser jika label perangkat belum diizinkan oleh browser.
- [x] Mengganti perangkat memanggil `setSinkId` secara nyata ke elemen audio.
- [x] Slider switch Exclusive Mode menyimpan status dan mengaktifkan mode Bit-Perfect.
- [x] Build `pnpm build` dan `cargo check` lulus 100% tanpa error atau warning.
