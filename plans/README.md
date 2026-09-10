# 📋 WowMusicPlayer - Implementation Plans Management

Direktori ini adalah pusat pengelolaan dokumen rencana implementasi (*implementation plans*) untuk seluruh pengembangan fitur, perbaikan bug, refactor, dan peningkatan arsitektur **WowMusicPlayer**.

Setiap perubahan kode **WAJIB** memiliki dokumen plan yang disetujui sebelum dieksekusi, sesuai ketentuan mutlak pada [AGENTS.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/AGENTS.md).

---

## 📂 Struktur Direktori

```
plans/
├── README.md        # Panduan tata kelola, aturan siklus hidup, dan indeks plan (file ini)
├── drafts/          # Rencana fitur / arsitektur masa depan yang masih dalam tahap perancangan
├── active/          # Rencana kerja yang telah disetujui dan sedang aktif dieksekusi
└── finished/        # Rencana kerja & milestone yang telah selesai 100% dan terverifikasi
```

---

## 🔄 Siklus Hidup Dokumen Plan (*Plan Lifecycle*)

1. **Tahap Perancangan (`drafts/`)**:
   - Ide fitur, refactor, atau revisi arsitektur ditulis di dalam direktori `plans/drafts/` dengan format nama `PLAN-XXX-<nama-fitur>.md`.
   - Dokumen ini berisi latar belakang, analisis dampak, file yang akan diubah, serta *step-by-step breakdown*.
   - Dokumen dipresentasikan kepada pengguna untuk ditinjau (*review*).

2. **Tahap Eksekusi Aktif (`active/`)**:
   - Setelah pengguna memberikan persetujuan eksplisit (misal: *"Setuju"*, *"Lanjutkan"*, *"Oke Gass"*), dokumen dipindahkan dari `drafts/` ke `active/`:
     ```bash
     mv plans/drafts/PLAN-XXX-<nama>.md plans/active/
     ```
   - Agent / developer melakukan implementasi dengan disiplin hanya mengikuti poin-poin yang ada di dalam plan aktif tersebut.
   - Status di dalam dokumen plan diubah menjadi `Status: In Progress (Active)`.

3. **Tahap Penyelesaian & Verifikasi (`finished/`)**:
   - Setelah seluruh langkah selesai dikerjakan dan diverifikasi secara nyata (audio terdengar, build lolos, test pass, UI Apple Music standard terpenuhi):
   - Dokumen dipindahkan dari `active/` ke `finished/`:
     ```bash
     mv plans/active/PLAN-XXX-<nama>.md plans/finished/
     ```
   - Catat penyelesaian tersebut ke dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md) dengan entri `[MEM-XXX]`.

---

## 🏷️ Konvensi Penamaan Dokumen

- Format penamaan: `PLAN-<NOMOR_3_DIGIT>-<kebab-case-deskripsi>.md`
- Contoh:
  - `PLAN-001-core-architecture-and-audio.md`
  - `PLAN-004-local-audio-file-importer.md`

---

## 📝 Template Standar Dokumen Plan

Setiap dokumen plan baru wajib menggunakan struktur berikut:

```markdown
# 📋 PLAN-XXX: <Judul Rencana Implementasi>

- **ID Plan**: PLAN-XXX
- **Status**: [Draft | Active | Finished]
- **Kategori**: [Audio Core | UI/UX | Cloud Sync | Streaming | Platform Integration]
- **Target File**: 
  - `src/...`
  - `src-tauri/...`
- **Tanggal Dibuat**: YYYY-MM-DD
- **Tanggal Selesai**: YYYY-MM-DD (jika sudah finished)

---

### 1. Latar Belakang & Kebutuhan Fitur
Penjelasan mendalam mengenai masalah yang ingin dipecahkan, kebutuhan pengguna, atau peningkatan arsitektur yang dibutuhkan.

---

### 2. File yang Akan Dibuat / Dimodifikasi
Daftar spesifik file dan penjelasan singkat perubahan masing-masing file.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. Langkah 1
2. Langkah 2
3. Langkah 3

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**:
- **Dependensi Baru**:
- **Trade-off / Pertimbangan Khusus**:

---

### 5. Kriteria Penerimaan & Verifikasi Nyata (Real End-to-End Verification)
- [ ] Pengujian fungsi nyata (suara audio nyata keluar dari hardware, dynamic data).
- [ ] Kepatuhan Zero-Slop Apple Music UI (tidak ada alert browser, tidak ada toast/modal penghalang pemutaran, bebas jargon teknis).
- [ ] `cargo check`, `cargo test`, dan `pnpm build` 100% lolos.
- [ ] Pembaruan [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md).
```

---

## 📑 Indeks Dokumen Plan

### 🏁 Selesai (Finished)
| ID | Judul Plan | Kategori | Lokasi Berkas |
| :--- | :--- | :--- | :--- |
| **PLAN-001** | Core Architecture & Native Audio Engine Setup | Audio Core | [`plans/finished/PLAN-001-core-architecture-and-audio.md`](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/plans/finished/PLAN-001-core-architecture-and-audio.md) |
| **PLAN-002** | Universal Search & HiFi Stream Resolver | Streaming | [`plans/finished/PLAN-002-universal-search-and-resolver.md`](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/plans/finished/PLAN-002-universal-search-and-resolver.md) |
| **PLAN-003** | Consumer UI Polish, Zero-Friction & Real LRCLIB | UI/UX | [`plans/finished/PLAN-003-consumer-ui-and-real-lyrics.md`](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/plans/finished/PLAN-003-consumer-ui-and-real-lyrics.md) |
| **PLAN-004** | Expanded Now Playing Fullscreen & Bottom Bar Lyrics | UI/UX | [`plans/finished/PLAN-004-expanded-player-and-bottom-bar-lyrics.md`](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/plans/finished/PLAN-004-expanded-player-and-bottom-bar-lyrics.md) |

### ⚡ Sedang Berjalan (Active)
*(Tidak ada plan aktif saat ini)*

### 💡 Draf Rencana Masa Depan (Drafts)
*(Tidak ada draf saat ini)*

