# Kebijakan Keamanan (Security Policy)

Keamanan akun, privasi pengguna, dan perlindungan hak cipta konten audio adalah prioritas utama dalam pengembangan **WowMusicPlayer**.

---

## 1. Arsitektur Zero-Knowledge Vault (Cloud Sync)
WowMusicPlayer menggunakan prinsip enkripsi sisi-klien (*Client-Side Encryption*) untuk seluruh data sensitif:
- **Kredensial Pihak Ketiga**: Token akses TIDAL, refresh token, dan sesi Spotify/YouTube tidak pernah disimpan dalam bentuk teks polos (*plain-text*), baik di penyimpanan lokal maupun di database cloud.
- **Algoritma Enkripsi**: Menggunakan **AES-256-GCM** dengan salt unik per-akun, di mana kunci derivasi diturunkan menggunakan fungsi **Argon2id**.
- **Prinsip Zero-Knowledge**: Server cloud WowMusic tidak memiliki akses terhadap kunci enkripsi pengguna dan tidak dapat mendekripsi token layanan streaming pengguna.

---

## 2. Kepatuhan API & Hak Cipta Musik
- WowMusicPlayer **TIDAK** berfungsi sebagai alat ripper atau pengunduh musik ilegal.
- Seluruh pemutaran audio dari TIDAL dilakukan melalui saluran streaming resmi yang terotentikasi dengan akun TIDAL aktif milik pengguna, mematuhi persyaratan pengembang TIDAL.
- Decrypted stream buffer hanya ada di memori volatile RAM untuk kebutuhan pemutaran audio langsung dan tidak disimpan ke penyimpanan permanen.

---

## 3. Pelaporan Kerentanan (Reporting a Vulnerability)
Jika Anda menemukan kerentanan keamanan dalam WowMusicPlayer, mohon untuk tidak membuat issue publik di GitHub. 

Silakan laporkan melalui:
- **Email**: `security@wowmusic.app` (atau kontak pengembang via profil GitHub [@inimuqsith](https://github.com/inimuqsith))
- **Enkripsi**: Anda dapat meminta public PGP key kami sebelum mengirim rincian eksploit.

Kami berkomitmen untuk merespons laporan Anda dalam waktu maksimal 48 jam dan menyediakan pembaruan keamanan sesegera mungkin.
