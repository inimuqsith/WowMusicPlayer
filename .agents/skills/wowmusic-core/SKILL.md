---
name: wowmusic-core
description: Core architectural rules, real audio verification standards, and zero-slop consumer UX principles for WowMusicPlayer.
---

# WowMusicPlayer - Core Engineering & UX Skill

Dokumen keahlian dan pedoman mutlak pengembangan **WowMusicPlayer** sebagai pemutar musik mandiri (*Independent Universal Music Hub*).

---

## 1. Prinsip Produk & Pengalaman Pengguna (Consumer UX)
- **Pemutar Musik Mandiri (*Independent Music Hub*)**:
  - Aplikasi adalah pemutar musik kelas dunia (estetika Apple Music / Hi-Fi minimalis), bukan sekadar wrapper API pihak ketiga.
  - **Beranda & Pencarian WAJIB 100% Bebas Login**: Siapa pun yang membuka aplikasi langsung melihat lagu-lagu populer dunia nyata dan dapat langsung memutarnya tanpa hambatan login.
- **DILARANG KERAS Menggunakan Istilah Teknis Developer di UI**:
  - Hindari jargon seperti *"Musik Asli"*, *"LRCLIB (Time-Synced)"*, *"Master Lossless 256kbps"*, *"AES-256-GCM Vault"*, *"Connected to VPS"*.
  - Gunakan bahasa konsumer elegan: *"Dengarkan Musik Favorit"*, *"Lagu Populer Dunia"*, *"Lirik"*.
- **Zero-Intrusion Playback**:
  - Dilarang memunculkan pop-up modal penghalang saat pengguna menekan tombol putar lagu.
  - Dilarang membombardir pengguna dengan spam notifikasi toast (*"Memutar: ..."*, *"Mencari stream..."*). Pemutaran audio harus dimulai secara instan dan hening, dengan visual dock player sebagai indikator aktif.

---

## 2. Hierarki Pemutaran Audio Nyata
1. **Mode Standalone / Belum Terhubung Service**:
   - Jika akun streaming (seperti TIDAL) belum ditautkan, aplikasi secara otomatis memutar audio pratinjau studio 30 detik (`0:30`) sebagai fallback bawaan yang mulus.
2. **Mode Service Terhubung (TIDAL HiFi)**:
   - Jika akun TIDAL telah ditautkan di menu Pengaturan, pemutar secara otomatis meng-*upgrade* pemutaran lagu ke **versi lagu penuh (*Full-Length*)**, mengambil manifest streaming resmi (`playbackinfopostpaywall`) dan memutar stream audio dari CDN resmi TIDAL tanpa batas 30 detik.
3. **Penyimpanan Token & Sesi**:
   - Sesi login pihak ketiga (token TIDAL) wajib disimpan secara persisten di `localStorage` (`wowmusic_tidal_token`) agar tidak hilang saat aplikasi dimuat ulang.

---

## 3. Lirik Otomatis (LRCLIB Dynamic Engine)
- Seluruh pengambilan lirik wajib memanggil endpoint dinamis LRCLIB (`https://lrclib.net/api/get`) berdasarkan judul lagu dan artis yang sedang diputar.
- Parsing tag timestamp format LRC (`[mm:ss.xx]`) secara dinamis.
- **Haram Menampilkan Lirik Palsu / Statis**: Jika lirik suatu lagu belum tersedia, tampilkan placeholder *"Lirik belum tersedia untuk lagu ini"*, dilarang keras membocorkan lirik lagu lain (seperti Bohemian Rhapsody).

---

## 4. Protokol Pengembangan Wajib (`AGENTS.md`)
1. **Wajib Membuat Plan Sebelum Eksekusi**:
   - Analisis masalah, rincian file yang diubah, langkah-langkah kerja teknis, dan potensi dampak.
   - Wajib menunggu persetujuan eksplisit pengguna sebelum memodifikasi kode.
2. **Verifikasi Nyata (Real End-to-End Testing)**:
   - Dilarang klaim selesai tanpa bukti verifikasi nyata (suara nyata mengalir dari speaker, build lulus `pnpm build`, `cargo check`, `cargo test`).
   - Dilarang keras menggunakan dialog browser `alert()`, `confirm()`, atau `prompt()`.
3. **Selalu Update Dokumentasi (`MEMORY.md` & `AGENTS.md`)**:
   - Setiap keputusan arsitektural dan implementasi milestone baru wajib dicatat rapi ke `MEMORY.md`.
