# 📋 PLAN-006: Cross-Device Handoff via WebSocket

- **ID Plan**: PLAN-006
- **Status**: Draft
- **Kategori**: Real-Time Communication & Platform Integration
- **Target File**: 
  - `src-tauri/src/sync/ws.rs`
  - `src-tauri/src/main.rs`
  - `src/services/handoff.ts`
  - `src/App.tsx`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: -

---

### 1. Latar Belakang & Kebutuhan Fitur
Memungkinkan pengguna mengontrol pemutaran musik di satu perangkat (misal: PC desktop) dari perangkat lain (misal: smartphone atau laptop lain) secara real-time seperti fitur *Spotify Connect*:
1. Menampilkan daftar perangkat aktif (*Active Devices*) yang terhubung dengan akun WowMusic yang sama.
2. Melakukan *Handoff*: Memindahkan pemutaran aktif dari Perangkat A ke Perangkat B beserta posisi detik pemutaran (*timestamp*) dan antrean playlist.
3. Mengontrol Play, Pause, Next, Volume dari jarak jauh (*Remote Control*).

---

### 2. File yang Akan Dibuat / Dimodifikasi
- `src-tauri/src/sync/ws.rs`: Koneksi WebSocket persisten ke server perantara di VPS WowCloud (`wss://.../ws/handoff`).
- `src-tauri/src/main.rs`: Handler event Tauri untuk menerima instruksi remote play/pause.
- `src/services/handoff.ts`: State management perangkat aktif dan pengiriman perintah kendali.
- `src/App.tsx`: Menu modal/drawer elegan "Perangkat Terhubung" (*Connect Device*) di bilah navigasi bawah.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Registrasi Perangkat**:
   - Setiap client membuat `device_id` unik dan mendaftarkan metadata perangkat (nama OS, tipe perangkat).
2. **Protokol Pesan WebSocket**:
   - Event `DEVICE_HEARTBEAT`: Mendeteksi perangkat yang sedang aktif/online.
   - Event `PLAYBACK_STATE_UPDATE`: Mengabarkan status lagu saat ini, posisi waktu, dan status pemutaran.
   - Event `COMMAND_TRANSFER_PLAYBACK`: Memerintahkan perangkat tujuan untuk mengambil alih stream audio.
   - Event `COMMAND_MEDIA_CONTROL`: Perintah Play/Pause/Seek/Volume dari perangkat pengendali.
3. **Sinkronisasi Halus (Seamless Transition)**:
   - Fade-out volume di perangkat asal, lalu mulai pemutaran di perangkat baru pada detik yang sama dengan fade-in halus.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Ekosistem multi-perangkat terpadu yang membuat WowMusicPlayer semakin bernilai tinggi bagi pengguna sehari-hari.
- **Dependensi Baru**: `tokio-tungstenite` di Rust / WebSocket API standar di web frontend.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [ ] Perangkat terdeteksi di menu perangkat aktif secara real-time (< 500ms).
- [ ] Menekan tombol Play/Pause di perangkat remote langsung mengubah status pemutaran di perangkat utama.
- [ ] Handoff memindahkan lagu beserta antrean dengan mulus tanpa putus.
- [ ] Dicatat dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md).
