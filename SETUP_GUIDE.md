npm # Panduan Menjalankan Project ArchFlow dari Awal

Dokumen ini memandu Anda langkah demi langkah untuk menjalankan aplikasi **ArchFlow** di komputer lokal Anda (Localhost) dari awal (*from scratch*).

## Prasyarat
Sebelum memulai, pastikan perangkat Anda sudah terpasang:
1. **Node.js** (rekomendasi: versi 18+ atau 20+)
2. **PostgreSQL** (pastikan sudah berjalan di komputer lokal)
3. **Git** (opsional)

---

## 1. Instalasi Dependensi
Project ini adalah monorepo (berisi frontend `apps/web` dan backend `apps/api`), jadi cukup instal dependensi dari *root* folder.
Dikarenakan ada *git hook* (husky) yang mungkin bermasalah di Windows, gunakan `--ignore-scripts` jika proses gagal.

1. Buka terminal Anda di folder utama project (`archflow`).
2. Jalankan perintah instalasi:
   ```bash
   npm install --ignore-scripts
   ```

---

## 2. Konfigurasi Database (PostgreSQL)
Aplikasi ini membutuhkan database PostgreSQL untuk menyimpan data seperti proyek, kanvas, komponen, dan akun pengguna.

1. Buka **pgAdmin** atau terminal PSQL Anda, lalu **buat database baru** bernama `archflow_db`.
2. Pastikan *username* dan *password* yang digunakan memiliki akses ke database tersebut.
3. Update file `.env` di **2 (dua) lokasi** berikut dengan informasi kredensial yang tepat:
   
   **File 1: `/.env`** (di root project)
   **File 2: `/apps/api/.env`**
   
   Isikan *connection string* sesuai format berikut:
   ```env
   # Format: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]?schema=public
   DATABASE_URL="postgresql://postgres:password12345@localhost:5432/archflow_db?schema=public"
   ```
   *(Ganti `postgres` dan `password12345` sesuai dengan username dan password PostgreSQL di komputer Anda).*

---

## 3. Migrasi Database (Prisma)
Setelah database dan `.env` terkonfigurasi, kita perlu menyinkronkan *schema* tabel agar database Anda memiliki tabel-tabel yang dibutuhkan.

Karena *schema* Prisma terletak di dalam folder backend, Anda harus berpindah direktori (folder) terlebih dahulu:

1. Di terminal, pindah ke folder `apps/api`:
   ```bash
   cd apps/api
   ```
2. Lakukan *push schema* ke dalam database PostgreSQL Anda:
   ```bash
   npx prisma db push
   ```
3. *(Opsional)* Generate ulang Prisma Client agar tipe datanya tersinkronisasi di code Anda:
   ```bash
   npx prisma generate
   ```

---

## 4. Menjalankan Aplikasi
Setelah database selesai di-set up, Anda siap untuk menjalankan web dan API-nya secara bersamaan.

1. Kembali ke folder *root* project Anda:
   ```bash
   cd ../../
   ```
2. Mulai *Development Server*:
   ```bash
   npm run dev
   ```

Tunggu hingga Turborepo/Turbopack selesai mem-build (biasanya sekitar 5–15 detik).
Anda akan melihat *output* bahwa kedua *service* berjalan.

- **Frontend (Web):** Buka `http://localhost:3000` di browser Anda.
- **Backend (API):** Berjalan di `http://localhost:4000/api`.

---

## Troubleshooting Cepat

* **Error "P1000: Authentication failed against database server" saat `prisma db push`**
  Ini berarti *username* atau *password* PostgreSQL salah. Cek lagi koneksi di `.env`.

* **Error "Could not find Prisma Schema"**
  Ini terjadi jika Anda menjalankan `npx prisma db push` di *root* (folder `archflow`). Anda **wajib** menjalankan perintah tersebut di dalam folder `apps/api`.

* **Error 404 saat membuka Dashboard/Project**
  Seringkali terjadi saat server di-restart dan Anda menghapus database. Pastikan database `archflow_db` tidak terhapus. Jika tidak sengaja terhapus, segera jalankan ulang tahap **Migrasi Database** di atas, lalu matikan dan hidupkan kembali perintah `npm run dev`.
