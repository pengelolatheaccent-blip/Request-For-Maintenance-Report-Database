# Maintenance Log — Apartemen The Accent

Web app untuk mencatat, melacak, dan mencetak formulir *Request for Maintenance*
(permintaan & komplain maintenance) apartemen, sebagai pengganti file Excel
`Request For Maintenance Report Database.xlsx`.

**Stack:** React + Vite · Tailwind CSS · Supabase (Postgres + Auth) · Recharts
**Hosting:** GitHub Pages (frontend, statis) + Supabase (database & auth)

## Fitur

- **Dasbor** — total tiket, tiket terbuka/selesai, grafik per bulan, per departemen, per klasifikasi, dan perbandingan Request vs Komplain.
- **Daftar Tiket** — tabel dengan pencarian, filter status/jenis, dan pagination.
- **Tambah / Edit Tiket** — formulir lengkap sesuai kolom pada file Excel asli.
- **Cetak Formulir** — tampilan cetak per tiket, mirip sheet `PRINT` pada Excel.
- **Login staf** via Supabase Auth (email + kata sandi). Data hanya bisa diakses oleh staf yang login.
- **Data lama (4.184 baris)** dari Excel sudah disiapkan sebagai skrip SQL siap import di folder `supabase/`.

## 1. Menyiapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor** → New query → tempel isi `supabase/schema.sql` → **Run**.
   Ini membuat tabel `maintenance_requests`, index, trigger, dan aturan Row Level
   Security (hanya user yang login yang bisa baca/tulis).
3. **Import data lama (opsional tapi disarankan):**
   Buka `supabase/seed_data_part01.sql` s.d. `seed_data_part09.sql` satu per satu,
   tempel ke SQL Editor, lalu **Run** untuk masing-masing (9 bagian, @500 baris).
   Atau jika Anda menggunakan Supabase CLI / `psql`, jalankan langsung
   `supabase/seed_data_all.sql` yang berisi seluruh 4.184 baris sekaligus:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/seed_data_all.sql
   ```
4. **Buat akun staf:** Authentication → Users → Add user → isi email & kata sandi
   untuk setiap staf yang perlu akses. (Bisa juga aktifkan sign-up sendiri, tapi
   untuk tool internal biasanya lebih aman dibuat manual oleh admin.)
5. Salin **Project URL** dan **anon public key** dari Project Settings → API.
   Anda akan membutuhkannya di langkah berikut.

## 2. Menjalankan di lokal

```bash
npm install
cp .env.example .env
# lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
npm run dev
```

Buka `http://localhost:5173`, login dengan akun staf yang sudah dibuat di Supabase.

## 3. Deploy ke GitHub Pages

Repo ini sudah menyertakan workflow GitHub Actions (`.github/workflows/deploy.yml`)
yang otomatis build & deploy setiap kali push ke branch `main`.

1. Buat repository baru di GitHub, push project ini ke sana.
2. Di GitHub: **Settings → Pages → Build and deployment → Source** pilih
   **GitHub Actions**.
3. Di **Settings → Secrets and variables → Actions**, tambahkan dua *repository secret*:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push ke `main` — workflow akan build project lalu deploy ke GitHub Pages.
   URL app akan muncul di tab **Actions** setelah selesai, formatnya biasanya
   `https://<username>.github.io/<nama-repo>/`.

> Workflow otomatis mengatur base path sesuai nama repository. Jika Anda deploy
> ke domain root (`<username>.github.io`), hapus baris `VITE_BASE_PATH` di
> `.github/workflows/deploy.yml`.

## Struktur Data

Tabel `maintenance_requests` menyimpan semua kolom yang ada di sheet `DATABASE`
pada file Excel asli (nomor form, tanggal, unit, penyewa, isi permintaan,
klasifikasi, departemen, pekerjaan yang dilakukan, material, status, penutupan
tiket, umpan balik penghuni, dst). Lihat `supabase/schema.sql` untuk daftar
kolom lengkap.

## Struktur Proyek

```
src/
  components/     Layout, badge status, route terproteksi
  context/        AuthContext (Supabase Auth)
  lib/            Supabase client & daftar pilihan dropdown
  pages/          Login, Dashboard, RequestsList, RequestForm, PrintView
supabase/
  schema.sql            Skema tabel + RLS
  seed_data_part*.sql   Data lama dari Excel (9 bagian @500 baris)
  seed_data_all.sql     Seluruh data lama dalam satu file (untuk psql/CLI)
```

## Catatan

- Autentikasi memakai Supabase Auth email/password. Untuk menambah staf baru,
  buat akun lewat Supabase Dashboard (Authentication → Users), tidak ada
  halaman sign-up di app ini secara sengaja (agar akses tetap terkontrol).
- Kolom yang jarang dipakai dari file Excel asli (mis. `any_time`,
  `appointment`, `date2`, `time2`) tetap tersimpan di database untuk menjaga
  data lama, tapi tidak ditampilkan di formulir karena jarang diisi.
- Jika ingin publik (mis. penghuni) bisa membuat tiket tanpa login, tambahkan
  policy RLS baru untuk role `anon` pada `insert` di `schema.sql`.
