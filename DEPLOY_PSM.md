# Panduan Deploy ArchFlow di Personal Server Manager (PSM)

ArchFlow sudah dikonfigurasi agar dapat di-deploy sebagai **single-container** melalui **Personal Server Manager (PSM)** dengan Nginx reverse proxy internal, sinkronisasi skema Prisma otomatis, dan seed template bawaan.

---

## 1. Pengaturan Form Deploy di Dashboard PSM (`:3005` / `psm.homelab`)

Masuk ke **`Projects` → `Deploy Project`**, lalu isi parameter berikut:

| Field PSM | Nilai yang Disarankan | Catatan |
|---|---|---|
| **Project Name** | `archflow` | Akan menjadi nama container `archflow` |
| **Source Type** | `Git Repository` | — |
| **Repository URL** | `https://github.com/this-is-asepjourney/archflow.git` | Pastikan perubahan sudah di-push ke branch target |
| **Branch** | `main` | — |
| **Dockerfile Path** | `Dockerfile` | Root `Dockerfile` otomatis dipakai oleh `psm-agent` |
| **Port Mapping** | *(Kosongkan / biarkan auto-allocate PSM)* | `psm-agent` otomatis mencari port host kosong `>= 3100` dan memetakannya ke container port **`3000`** |
| **Domain** | `archflow.homelab` | Otomatis didaftarkan ke CoreDNS & `homelab_router` Nginx (termasuk WebSocket `/socket.io/`) |
| **Database** | **`PostgreSQL`** | PSM akan membuat database `archflow` di PostgreSQL homelab & menyuntikkan `DATABASE_URL` otomatis |

> **Catatan:** Jangan menambahkan `docker-compose.yml` di root repo jika di-deploy lewat PSM agar `psm-agent` tetap menggunakan alur `Dockerfile` (auto-attach network `homelab`, port-guard otomatis, dan registrasi domain otomatis).

---

## 2. Environment Variables (`.env`) di PSM

PSM akan otomatis mengisi variabel database PostgreSQL (`DATABASE_URL`, `POSTGRES_*`, `DB_*`) dan `PORT=3000`. Tambahkan atau ubah variabel berikut di tab **Environment Variables** pada project ArchFlow di PSM:

```env
JWT_SECRET=ganti_dengan_secret_acak_panjang_minimal_32_karakter
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
```

### Penjelasan Variabel Opsional
- **`COOKIE_SECURE`**: Biarkan `false` saat diakses lewat HTTP (`http://archflow.homelab` atau `http://192.168.25.105:<port>` / Tailscale IP). Ubah ke `true` hanya jika sudah memakai HTTPS reverse proxy.
- **`CORS_ORIGINS`**: Opsional. Secara default sudah mengizinkan origin request karena frontend & API berjalan di origin yang sama (`/api` dan `/socket.io/` melalui Nginx port `3000`). Jika ingin membatasi origin, isi daftar dipisah koma, misalnya `http://archflow.homelab,http://192.168.25.105:3100`.
- **`SKIP_DB_SEED`**: Set `true` jika tidak ingin menjalankan seed template otomatis saat container start.
- **`API_NODE_OPTIONS` / `WEB_NODE_OPTIONS`**: Default masing-masing `--max-old-space-size=256` agar nyaman dalam batas memori container PSM (`768m`).

---

## 3. Apa yang Terjadi Saat Container Start

1. Nginx internal merender konfigurasi reverse proxy pada port `${PORT:-3000}`:
   - `/api/*` → NestJS API (`127.0.0.1:4000`)
   - `/uploads/*` → NestJS static uploads (`127.0.0.1:4000`)
   - `/socket.io/*` → NestJS WebSocket Gateway (`127.0.0.1:4000`)
   - `/*` → Next.js standalone (`127.0.0.1:3001`)
2. Entrypoint menunggu PostgreSQL siap (maksimal 10 percobaan × 3 detik), lalu menjalankan:
   - `prisma db push --skip-generate --schema=./prisma/schema.prisma`
   - `node dist/prisma/seed.js` (idempoten — aman dijalankan berulang kali saat redeploy/restart)
3. Menjalankan NestJS API, Next.js Web, dan Nginx secara bersamaan.

---

## 4. Verifikasi Setelah Deploy

1. **Health Check API (lewat proxy port `3000`):**
   ```bash
   curl -s http://127.0.0.1:<HOST_PORT>/api/health
   # atau via domain:
   curl -s -H "Host: archflow.homelab" http://127.0.0.1/api/health
   ```
   Respons normal: `{"status":"ok","timestamp":"..."}`.
2. **Buka UI di Browser:**
   - `http://archflow.homelab` (jika DNS lokal / hosts sudah aktif), atau
   - `http://192.168.25.105:<HOST_PORT>` (LAN), atau
   - `http://100.78.113.53:<HOST_PORT>` (Tailscale).
3. **Uji Alur Utama:**
   - Daftar akun baru (`/register`) atau login (`/login`), pastikan redirect ke `/dashboard` berhasil (cookie `access_token` tersimpan meski diakses via HTTP).
   - Cek halaman **Templates** untuk memastikan template bawaan (`E-Commerce Microservices`, `SaaS Monolith`, `Blog Platform ERD`) ter-seed.
   - Buka canvas editor dan cek koneksi WebSocket (`/socket.io/`).
   - Coba upload custom component icon (`/uploads/...`) dan pastikan gambar tampil.

---

## 5. Catatan Penyimpanan Upload (`/app/apps/api/uploads`)

Ikon custom component yang di-upload disimpan di dalam container pada direktori `/app/apps/api/uploads` (dapat diubah via `UPLOAD_DIR`). Jika suatu saat diperlukan persistensi file upload lintas rebuild container penuh, mount volume Docker ke `/app/apps/api/uploads`.
