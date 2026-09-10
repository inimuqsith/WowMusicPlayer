# 📋 PLAN-005: WowCloud Encrypted Vault Sync (AES-256-GCM)

- **ID Plan**: PLAN-005
- **Status**: Draft
- **Kategori**: Cloud Sync & Cryptography
- **Target File**: 
  - `src-tauri/src/vault/mod.rs`
  - `src-tauri/src/vault/crypto.rs`
  - `src-tauri/src/sync/client.rs`
  - `src/services/vault.ts`
  - `src/App.tsx`
- **Tanggal Dibuat**: 2026-09-10
- **Tanggal Selesai**: -

---

### 1. Latar Belakang & Kebutuhan Fitur
WowMusicPlayer dirancang dengan prinsip privasi zero-knowledge. Pengguna ingin:
1. Menyimpan playlist kustom, token sesi (Spotify/TIDAL/YouTube), dan preferensi mereka di cloud (VPS WowCloud).
2. Memastikan server VPS sama sekali tidak dapat membaca plaintext data atau token rahasia pengguna (Zero Plaintext Secrets).
3. Melakukan enkripsi client-side dengan **AES-256-GCM** dengan kunci enkripsi yang diturunkan menggunakan **Argon2id** berbasis akun pengguna (Google Sign-In).
4. Pengalaman pengguna wajib mulus (*invisible zero-knowledge*): pengguna tidak perlu menghafal passphrase tambahan jika sudah login via akun terverifikasi.

---

### 2. File yang Akan Dibuat / Dimodifikasi
- `src-tauri/src/vault/crypto.rs`: Implementasi key derivation (Argon2id) dan cipher engine (AES-256-GCM) di Rust.
- `src-tauri/src/sync/client.rs`: Klien HTTPS/WebSocket untuk sinkronisasi blob terenkripsi ke backend VPS WowCloud.
- `src-tauri/src/main.rs`: Mendaftarkan IPC command `sync_vault_push`, `sync_vault_pull`.
- `src/services/vault.ts`: Wrapper client frontend untuk manajemen state sinkronisasi.

---

### 3. Rincian Langkah Kerja (Step-by-Step Breakdown)
1. **Derivasi Kunci**: Menggunakan user UID/salt dari token autentikasi Google Sign-In untuk menghasilkan master encryption key 256-bit via Argon2id.
2. **Enkripsi Payload**:
   - Seluruh playlist dan data sesi dikonversi ke JSON.
   - Di-enkripsi dengan nonce 96-bit acak menggunakan AES-256-GCM menghasilkan ciphertext + authentication tag (128-bit).
3. **Penyimpanan Cloud**:
   - Kirimkan blob ciphertext ke PostgreSQL di VPS via REST API `/api/v1/vault/sync`.
4. **Dekripsi Saat Pull**:
   - Saat login di perangkat baru, ambil ciphertext terbaru dan dekripsi lokal.
   - Muat ulang playlist ke state aplikasi secara otomatis.

---

### 4. Analisis Dampak & Dependensi
- **Dampak Arsitektur**: Keamanan tingkat enterprise; tidak ada risiko kebocoran token pengguna bahkan jika database server dibobol.
- **Dependensi Baru**: `aes-gcm`, `argon2`, `rand` pada Rust; endpoint PostgreSQL di VPS vps-advin.

---

### 5. Kriteria Penerimaan & Verifikasi Nyata
- [ ] Payload yang terkirim ke server 100% berupa ciphertext terenkripsi (tidak ada string token atau nama playlist dalam plaintext).
- [ ] Data dapat didekripsi dengan sempurna di perangkat kedua setelah login.
- [ ] `cargo test` untuk modul kriptografi lulus 100%.
- [ ] Dicatat dalam [MEMORY.md](file:///home/muqsith/orca/workspaces/WowMusicPlayer/main/MEMORY.md).
