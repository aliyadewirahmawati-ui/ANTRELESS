# Antreless — Hemat Waktu. Tanpa drama antre.

Website makanan dan minuman untuk pelanggan umum dan kantin mana saja. Navy #102C46, toska #12B99A, kuning #FFBF32, putih #FFFFFF, dan toska muda #E8F8F4. CSS variables utama ada di style.css; src/overrides.css mengikuti desain tersebut.

## Perubahan

- Hero baru dan teks umum tanpa batas institusi/lokasi.
- 45 menu, 58 pilihan dari transkripsi pengguna. Satu Kantin Demo yang dapat diubah; database mendukung banyak kantin.
- Empat foto belum tersedia pada lampiran implementasi. Menu awal nonaktif, harga belum terverifikasi, stok 0, tanpa promo otomatis. Daftar konfirmasi: MENU_PERLU_KONFIRMASI.md.
- Prasmanan/seblak tidak menggunakan harga mulai Rp8.000 sebagai harga final. Enam menu ayam/soto belum memiliki harga; minuman kemasan menunggu merek/ukuran/harga.
- Placeholder kategori untuk katalog; foto hero hanya ilustrasi.
- Layanan dokumen dan slot wajib 10 menit dihapus dari alur aktif.
- Supabase Auth, database bersama, Realtime dan polling menggantikan simulasi bisnis localStorage.
- Checkout menghasilkan satu pesanan per kantin dengan antrean/status/subtotal/perkiraan siap sendiri.

Tanpa konfigurasi Supabase: hanya katalog referensi, login/checkout dinonaktifkan. Transaksi lokal tidak ditampilkan sebagai pesanan online.

## Menjalankan

Node.js 22+ dan npm diperlukan. Build menggunakan esbuild-wasm agar dapat berjalan pada Windows yang memblokir modul native. Pengujian lokal tidak membutuhkan Docker.

1. npm install (atau npm ci setelah lockfile tersedia).
2. Salin .env.example ke .env.local. Isi konfigurasi publik bila Supabase tersedia.
3. npm run dev -> http://127.0.0.1:5500. Simpan source dan refresh setelah build otomatis selesai.
4. npm run build -> dist/.
5. npm run preview -> preview dist/ pada port 5500 (ubah melalui PORT bila perlu).

Gunakan server HTTP, bukan file:// atau Live Server pada source index.html: import Supabase harus dibundel.

## Setup Supabase

1. Buat proyek Supabase atau gunakan proyek yang tersedia. Migrasi dirancang untuk tabel publik baru; tinjau konflik nama jika database sudah memiliki tabel dengan nama yang sama.
2. SQL Editor: jalankan supabase/migrations/202610100001_shared_orders.sql secara utuh. Migrasi bersifat transaksional.
3. Opsional: jalankan supabase/seed.sql. Seed idempotent dan tidak menimpa perubahan admin atau riwayat nyata saat diulang.
4. Project Settings / API Keys: ambil Project URL dan publishable key (legacy anon juga didukung).
5. .env.local:
   VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=PUBLIC_PUBLISHABLE_KEY
6. Restart dev/build. Jangan gunakan secret/service-role. Build hanya memasukkan konfigurasi publik dan tidak menyalin .env ke dist/.

Dokumentasi key: https://supabase.com/docs/guides/getting-started/api-keys

## Auth dan akun admin

Aktifkan Email/Password pada Supabase Auth. Atur Site URL ke domain produksi serta Redirect URLs untuk domain produksi dan localhost yang dipakai. Pendaftaran umum menghasilkan buyer; trigger mengabaikan role dari metadata signup.

Buat akun baru dan konfirmasikan email sesuai konfigurasi Supabase. Akun/password demo lama tidak otomatis menjadi akun Supabase. Password tidak disimpan sendiri dalam profil/localStorage; sesi ditangani SDK Auth.

Untuk admin yang sebelumnya dipakai, daftarkan aliyadewirahmawati@gmail.com sebagai pengguna Supabase dengan password baru pilihan pemilik. Jangan gunakan password demo versi lama. Setelah terdaftar, pemilik proyek menjalankan SQL tepercaya:

do $$
declare admin_uid uuid;
begin
  select id into admin_uid from auth.users where lower(email)=lower('aliyadewirahmawati@gmail.com');
  if admin_uid is null then raise exception 'Daftarkan akun Supabase terlebih dahulu'; end if;
  update public.profiles set role='admin' where id=admin_uid;
  insert into public.kantin_admins(kantin_id,user_id)
    select id,admin_uid from public.kantin where id='00000000-0000-4000-8000-000000000001'
    on conflict do nothing;
end $$;

Tanpa seed, admin dapat membuat kantin baru dari dashboard dan otomatis menjadi admin kantin tersebut. Untuk akses kantin lain, pemilik memasukkan pasangan kantin_id/user_id pada kantin_admins melalui SQL Editor. Role admin tidak memberi akses ke semua kantin. Frontend tidak menentukan role berdasarkan email.

Halaman masuk satu untuk pembeli/admin. “Lupa kata sandi” menggunakan Supabase Auth; ini pemulihan akun, bukan notifikasi pesanan. Tidak ada janji email/push status pesanan saat aplikasi ditutup.

## Mengaktifkan menu nyata

1. Ubah nama/lokasi/jam kantin dan matikan penanda Kantin Demo. Jam awal 06.30–17.00 WIB; buka harus sebelum tutup pada hari yang sama.
2. Verifikasi nama/kepemilikan menu, lalu centang verifikasi pada editor menu.
3. Isi pilihan rasa/jenis, harga final, stok nyata, konfirmasi harga, dan aktifkan pilihan.
4. Prasmanan/seblak: nonaktifkan pilihan “Pilihan belum dikonfigurasi”; tambahkan pilihan konkret dengan harga final.
5. Aktifkan menu serta “Terima pesanan baru” setelah data siap. Jeda bila kantin kewalahan.

Kategori/nama menu diurut A–Z, filter Semua pertama. Pencarian meliputi nama/kategori/kantin. Angka hero berasal dari data aktual, termasuk menu yang masih perlu konfirmasi. Harga referensi bukan harga checkout sampai dikonfirmasi.

## Transaksi, status, stok

Database menghitung harga/total, memeriksa varian, verifikasi, stok, jam WIB dan jeda kantin. Pesanan beberapa kantin dan pengurangan stok ada dalam satu transaksi: gagal satu kantin membatalkan seluruh checkout. Lock konsisten, idempotency key, dan counter per kantin per tanggal WIB mencegah duplikasi, stok negatif, dan nomor bentrok.

Nomor ANT-001 dst dihitung per kantin/hari. Nama kantin/lokasi/menu/varian dan harga disimpan sebagai snapshot, sehingga pembaruan katalog tidak mengubah struk lama. Retry permintaan sama mengembalikan pesanan yang sama. Key sama dengan item/jumlah berbeda ditolak. Tas kosong hanya setelah server mengonfirmasi penyimpanan; error mempertahankan draft.

Menunggu konfirmasi -> Sedang diproses -> Siap diambil -> Selesai. Status berubah hanya oleh admin berwenang, bukan waktu. Perkiraan kesiapan dapat diperbarui dan diberi label perkiraan; riwayat perubahan disimpan.

Pembatalan wajib memiliki alasan. Pesanan Menunggu mengembalikan stok sekali; setelah diproses/siap stok makanan tidak dikembalikan otomatis. Kuota promo kembali hanya pada tanggal promo yang sama. Selesai/Dibatalkan tidak dapat diubah lagi.

## Last Call

Banner/kartu pratinjau tetap terlihat di luar jam promo; tidak ada diskon/stok bawaan. Admin mengatur promo per varian terverifikasi, harga di bawah normal, periode dalam 15.00–17.00 WIB, kuota dan sisa kuota. Pembelian promo mengurangi stok fisik dan kuota promo bersamaan. Kuota berganti pada transaksi pertama hari berikutnya, tetap dibatasi stok fisik aktual. Promo yang menjadi tidak valid setelah edit varian dinonaktifkan. Backend selalu memvalidasi harga/periode/stok terbaru.

## RLS dan sinkronisasi

Katalog dapat dibaca publik. Pembeli hanya melihat profil/pesanan/item/riwayat sendiri. Admin hanya mengelola kantin yang ditugaskan. Tidak ada izin INSERT/UPDATE/DELETE langsung dari client; fungsi RPC memeriksa Auth, role, status, dan kewenangan. Security definer memakai search_path kosong, schema berkualifikasi, serta EXECUTE terbatas.

Migrasi menambahkan tabel ke publication supabase_realtime jika tersedia. Periksa Database / Replication atau Realtime: public.kantin, menu, menu_variants, promos, orders, order_items, order_status_history, kantin_admins dan profiles harus diterbitkan. Jangan mengekspos schema private pada Data API.

Subscription mengambil ulang data ketika ada perubahan. Channel dibersihkan saat logout/pergantian akun. Polling 15 detik menjadi fallback, plus refetch saat online/halaman kembali terlihat. Database tetap sumber bisnis bersama.

Referensi:
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/realtime/postgres-changes
https://supabase.com/docs/reference/javascript/auth

## Data demo lama

Data lama tidak diubah menjadi akun/transaksi nyata. Key lama tetap disimpan pada browser asal agar riwayat tidak dihapus diam-diam. Draft lama tidak dipakai untuk checkout online, layanan dokumen tidak masuk alur aktif, dan ada pemberitahuan ketika data lama terdeteksi. Draft baru disimpan per Auth user, direkonsiliasi jika varian dihapus. localStorage aplikasi hanya untuk draft/preferensi; sesi Auth dikelola SDK.

## Vercel

Build Command: npm run build. Output Directory: dist. vercel.json sudah sesuai. Source SQL, catatan lokal, dokumentasi, test artifacts dan .env tidak disajikan dari output root.

Di Vercel Project Settings / Environment Variables, isi VITE_SUPABASE_URL serta VITE_SUPABASE_PUBLISHABLE_KEY untuk Production/Preview/Development yang dipakai. Tambahkan domain deployment pada Auth URL Supabase, lalu redeploy agar env masuk ke build. Secret/service-role tidak diperlukan di frontend.

Tanpa migrasi/env, build menjadi katalog referensi tanpa checkout. Push ke GitHub memicu deployment jika integrasi Vercel aktif. Deployment frontend tidak menerapkan migrasi pada Supabase; jalankan migrasi sesuai panduan di atas.

## Pengujian

- npm test: SQL migrasi/seed asli di PostgreSQL WebAssembly PGlite, dengan schema Auth stub. Meliputi grant/RLS, role signup, harga/snapshot, status, pembatalan, idempotency, rollback beberapa kantin, varian, stok, WIB dan promo. PGlite menyerialkan transaksi; tidak membuktikan contention dari koneksi produksi simultan.
- npm run test:browser: Chrome headless dengan profil sementara dan browser context terpisah. Adapter Auth/PostgREST pengujian di depan SQL/RLS/RPC asli; memeriksa polling status lintas sesi, checkout gagal/ulang, privasi, reload, editor stok, serta layout 320–1440 px. Screenshot pada test-artifacts/. Supabase Auth produksi dan WebSocket Realtime tidak diuji oleh adapter ini.
- npm run test:online: proyek Supabase staging dengan Auth/Realtime sesungguhnya; hanya berjalan bila .env.test berisi variabel berikut (diabaikan Git):
  ANTRELESS_TEST_URL
  ANTRELESS_TEST_KEY (publishable/anon)
  ANTRELESS_TEST_ADMIN_EMAIL
  ANTRELESS_TEST_ADMIN_PASSWORD
  ANTRELESS_TEST_BUYER_EMAIL
  ANTRELESS_TEST_BUYER_PASSWORD
  ANTRELESS_TEST_OTHER_EMAIL
  ANTRELESS_TEST_OTHER_PASSWORD
  ANTRELESS_TEST_ALLOW_WRITES=1

Tiga akun test harus berbeda, dengan role admin ditetapkan tepercaya. Test online membuat kantin/menu/pesanan, memeriksa Realtime, RLS, idempotency, status, login ulang dan perebutan stok terakhir. Setelah sukses kantin dinonaktifkan, riwayat test disimpan untuk pemeriksaan. Lakukan juga uji HP/laptop nyata sesuai alur pembeli/admin sebelum aktivasi produksi.

## File

index.html, style.css, src/overrides.css: desain.
src/app.js: Auth, katalog, draft, checkout, admin, status dan sinkronisasi.
src/supabase.js: client publik; src/domain.js: aturan tampilan dan WIB.
src/catalog.seed.js, supabase/seed.sql: katalog referensi.
supabase/migrations/202610100001_shared_orders.sql: schema, RLS, transaksi, grants dan publication.
scripts/generate-seed.js: membangkitkan seed/daftar konfirmasi dari satu sumber.
scripts/build.js, scripts/serve.js: build dan server.
tests/: uji lokal dan online opsional; .env.example: konfigurasi tanpa kredensial.

Masih diperlukan: Project URL/key publik, migrasi Supabase terpasang, konfigurasi Auth/Realtime, akun admin Supabase, verifikasi foto/menu, dan environment Vercel.
