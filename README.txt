# Antreless — produk & layanan kampus

Prototipe pre-order dan pengambilan produk serta layanan kampus dengan palet pink, peran admin/pembeli, stok, dan kapasitas antrean lokal.

## Menjalankan

Buka folder proyek di VS Code dan pilih index.html > Open with Live Server. Alternatif jika Python tersedia: `python -m http.server 5500`, lalu buka http://localhost:5500. Tidak membutuhkan npm, backend, atau API key. Fitur akun membutuhkan localhost dan penyimpanan browser aktif. Gunakan alamat situs yang sama; localhost dan 127.0.0.1 memiliki data browser berbeda.

## Akun

Satu halaman login tanpa pilihan peran:

- Admin: aliyadewirahmawati@gmail.com / admin. Nama Admin Antreless, langsung masuk dashboard. Email ini tidak dapat dipakai untuk mendaftar pembeli.
- Buat akun: selalu menjadi pembeli, kata sandi minimal 6 karakter.
- Jelajahi dengan akun demo: Pembeli Demo, email pembeli.demo@antreless.local / demo123.
- Ingat saya: hingga 30 hari. Tanpa centang: refresh pada tab yang sama, maksimal 12 jam. Sesi login terakhir disimpan bersama di browser; tab yang sudah terbuka tetap memakai akun aktifnya sampai logout atau refresh.
- Keluar kembali ke halaman login. Akun, keranjang, dan pesanan tersimpan. Kata sandi disimpan sebagai hash PBKDF2.

## Katalog dan mitra kampus

50 pilihan produk & layanan dari empat mitra kampus:

- Kantin A: 16 menu, Aneka Nasi, Bakso dan Soto, serta minuman.
- Kantin B: 14 menu, Bakmi, Jajanan, dan Thai Tea.
- Kantin C: 15 menu, Minuman dan Roti termasuk semua croissant.
- Fotokopi & Print Kampus: Fotokopi, Print Dokumen, Scan Dokumen, Jilid Spiral, Laminating.

Enam kategori makanan tetap tersedia: Aneka Nasi (8), Bakmi (5), Bakso dan Soto (6), Jajanan (8), Minuman (9), Roti (9). Panel Filter produk memisahkan chip Jenis (Semua menjadi pilihan pertama, ditambah Layanan Kampus) dan dropdown Mitra kampus. Pencarian meliputi nama, deskripsi, kategori, serta mitra kampus dan dapat digabungkan dengan chip Jenis serta dropdown Mitra kampus. Semua hasil A–Z. Harga makanan lama dan foto tetap digunakan; pilihan lain memakai ilustrasi SVG kategori.

## Detail layanan

Formulir wajib diisi sebelum layanan masuk ke tas. Detail disimpan dan ditampilkan pada keranjang, konfirmasi checkout, Pesanan Saya, dan dashboard admin. Jumlah +/− pada layanan berarti jumlah paket dengan detail yang sama; detail berbeda menjadi baris terpisah.

Harga simulasi per paket:

- Fotokopi: lembar × rangkap × Rp500 (hitam-putih) atau Rp1.500 (warna).
- Print Dokumen: Rp2.000 (hitam-putih) atau Rp5.000 (warna) per file/rangkap. Pilihan satu/dua sisi dicatat. Hanya nama file disimpan; isi dokumen tidak dibaca, diunggah, atau dikirim ke server.
- Scan Dokumen: halaman × Rp1.000; format PDF/JPG.
- Jilid Spiral: Rp8.000 per 100 halaman atau bagiannya × rangkap; pilihan warna cover.
- Laminating: lembar × Rp4.000 (A4) atau Rp8.000 (A3).

Jumlah lembar/halaman 1–5.000, rangkap 1–100, maksimal 100 paket per baris layanan. Angka wajib bulat positif. Semua harga masih simulasi.

## Jam operasional, slot dan stok

Operasional 06.30–17.00. Ada 63 slot 10 menit, dari 06.30–06.40 sampai 16.50–17.00, untuk pengambilan hari ini (WIB). Pembeli memilih satu slot bersama untuk semua mitra dalam tas. Slot harus tersedia pada setiap mitra yang dipilih. Slot ditutup/penuh tidak bisa dipilih; badge membedakan tersedia, hampir penuh, penuh, ditutup.

Kapasitas awal 5 pesanan per mitra per slot. Satu checkout memakai satu kapasitas pada setiap mitra yang berpartisipasi, berapa pun jumlah itemnya. Semua pesanan hari yang sama termasuk yang selesai dihitung sebagai penggunaan slot. Hampir penuh berarti sisa kapasitas tidak lebih dari 20% (minimal satu). Admin dapat mengubah kapasitas standar, kapasitas slot tertentu, serta membuka/menutup slot. Perubahan berlaku untuk pemesanan baru; pesanan yang sudah diterima tetap tersimpan.

Stok awal makanan/produk fisik: 20 per item. Semua layanan dokumen termasuk Fotokopi memakai status aktif tanpa stok angka. Admin dapat tambah/kurang stok, memasukkan angka 0–100.000, dan menandai produk/layanan Tidak tersedia. Stok 0 otomatis Habis hari ini; 1–5 Tersisa sedikit; >5 Tersedia. Penambahan stok pada item nonaktif tetap memerlukan aktivasi kembali.

Jumlah keranjang tidak boleh melebihi stok. Saat data berubah, item habis/nonaktif dihapus dari tas dan jumlah yang berlebih dikurangi dengan pesan yang jelas. Checkout memeriksa ulang stok dan kapasitas terbaru di dalam penguncian sebelum menyimpan. Pesanan, pengurangan stok, dan nomor ANT disimpan dalam satu penulisan sehingga kegagalan penyimpanan tidak menghabiskan stok atau nomor. Web Locks mencegah benturan antar-tab pada browser yang mendukungnya.

## Antrean dan admin

Nomor ANT-001, ANT-002, dan seterusnya terus berurutan setelah refresh dan berganti hari. Setelah checkout, nomor dan detail konfirmasi tampil jelas dan pembeli diarahkan ke Pesanan Saya. Pembeli hanya melihat pesanan miliknya dan tidak dapat mengubah status.

Admin melihat semua pesanan pada browser/alamat situs yang sama, ringkasan hari ini WIB, daftar menurut nomor dan waktu pembuatan, filter status, nama pembeli, item, total, serta slot. Status berurutan: Menunggu → Sedang disiapkan → Siap diambil → Selesai. Perubahan muncul otomatis di tab pembeli.

Reset data demo hari ini memerlukan konfirmasi di dashboard: stok kembali 20, layanan aktif, kapasitas standar 5, pengaturan khusus dihapus, semua slot dibuka, tiga promo Last Call contoh dipulihkan, dan pesanan hari ini dihapus. Akun, keranjang, riwayat hari sebelumnya, serta nomor ANT terakhir dipertahankan. Stok tidak direset otomatis saat berganti hari; gunakan tombol admin untuk memulai ulang demo.

## Last Call: Menu Hemat

Promo makanan/minuman layak konsumsi dari Kantin A, B, dan C tampil otomatis setiap hari 15.00 sampai sebelum 17.00 WIB. Layanan Fotokopi & Print Kampus tidak termasuk. Jam mengikuti waktu browser yang dikonversi ke WIB; tidak ada tombol untuk memaksakan jam promo pada aplikasi.

Data demo awal:

- Nasi Ayam Geprek (Kantin A): Rp18.000 → Rp15.000, kuota 5.
- Dimsum Mentai (Kantin B): Rp14.000 → Rp10.000, kuota 6.
- Croissant Original (Kantin C): Rp12.000 → Rp9.000, kuota 5.

Pop-up hanya untuk pembeli, maksimal sekali sehari pada browser yang sama, dan hanya jika ada promo aktif dengan stok tersedia. Pop-up menampilkan maksimal tiga menu. Lihat menu hemat membuka katalog dengan filter promo; filter Jenis, Mitra kampus, dan pencarian tetap dapat digabungkan. Nanti saja menutup pop-up tanpa memunculkannya lagi hari itu. Banner dan tombol filter tetap dapat digunakan saat jam promo.

Admin memilih menu kantin, menetapkan harga promo atau diskon 1–99%, stok promo, dan status aktif. Harga harus lebih rendah dari harga normal. Aktivasi memerlukan menu aktif dan stok utama serta stok promo >0. Stok promo merupakan bagian dari stok utama; kuota tidak dapat disimpan melebihi stok utama. Setiap pergantian hari, kuota promo diperbarui dari dailyStock, dibatasi stok utama aktual. Menambah kuota promo tidak menambah stok fisik makanan.

Checkout promo mengurangi stok promo dan stok utama dalam satu penulisan dengan pesanan/nomor antrean. Jumlah promo tidak boleh melebihi salah satu stok tersebut. Promo habis menampilkan Habis hari ini dan hilang dari pop-up. Admin melihat jumlah checkout yang mengandung menu promo pada hari ini WIB.

Slot promo harus belum berakhir dan berakhir paling lambat 17.00 (slot terakhir 16.50–17.00). Slot yang sudah lewat nonaktif. Pada 17.00, pop-up/banner/harga promo ditutup otomatis. Item promo kedaluwarsa, dinonaktifkan, atau berubah harga dihapus dari keranjang dengan pesan; tidak otomatis diubah menjadi pembelian harga normal. Untuk harga normal, pembeli menambahkan menu kembali. Riwayat pesanan yang telah dibuat tetap mempertahankan harga dan badge Menu Hemat.

State promos per ID menu berisi {active, mode, value, price, dailyStock, stock, stockDate}. Item promo pada keranjang/pesanan menambahkan {promotion: 'last-call', promoDate, originalPrice}; price menyimpan harga promo yang disepakati. Data operasional lama tanpa promos ditambahkan promo demo sekali tanpa mengubah pesanan sebelumnya.

## Penyimpanan lokal

- antreless-demo-accounts-v1: akun, nama, email, role, salt/hash kata sandi.
- antreless-demo-session-v1: sesi login, role, preferensi Ingat saya, ID sesi dan kedaluwarsa. sessionStorage hanya menyimpan penanda tab.
- antreless-last-call-popup-v1: tanggal WIB terakhir pop-up ditampilkan, bersama untuk seluruh akun pembeli pada browser/alamat situs yang sama.
- antreless-carts-v1: keranjang per email pembeli dan slot terpilih, termasuk detail layanan. Isi file tidak disimpan.
- antreless-orders-v2: {version: 2, lastQueueNumber, orders, inventory, partners, promos, lastResetAt?}. inventory memuat stok/active per ID katalog; partners memuat capacity dan slots {capacity, closed} per mitra.

Pesanan memuat id, queueSequence, queueNumber, buyerName, buyerEmail, items [{cartId, menuId, tenant, name, price, qty, details?}], total, slot, status, createdAt, statusHistory. Nilai status internal: waiting/preparing/ready/completed. Field tenant dipertahankan untuk kompatibilitas data lama; seluruh tampilan memakai istilah mitra kampus.

Data lama dimigrasikan tanpa mengubah akun, harga, dan nomor pesanan v2. Nama mitra lama dipetakan ke Kantin A/B/C; stok awal dikurangi sesuai pesanan makanan hari ini yang sudah ada. Format antrean lebih lama menggunakan cadangan antreless-demo-orders-v1. Data rusak tidak ditimpa otomatis.

Seluruh data hanya simulasi lokal pada browser yang sama. Pembayaran, email pemulihan, dan pengiriman pesanan sungguhan belum tersedia.

## Pengujian

Jalankan `node tests/campus-flow.cjs` dengan Node.js 22+ dan Google Chrome terpasang. Skrip membuka server lokal sementara dan profil browser uji terpisah; data browser utama tidak diubah. Jika Chrome berada di lokasi lain, set environment variable ANTRELESS_CHROME ke lokasi executable.

Pengujian mencakup akun/peran, katalog/filter, lima formulir layanan, tidak ada unggahan dokumen, keranjang lintas mitra dan persistensi, stok/status, slot penuh/ditutup, kapasitas, checkout bersamaan untuk stok terakhir, pesanan privat, status admin, kegagalan penyimpanan, reset, migrasi, lebar layar 320–1440 px, batas 15.00/17.00 WIB, pop-up sekali per hari antar-akun/tab, kuota promo harian, serta stok utama/promo pada checkout bersamaan. Jam uji dikendalikan dalam profil Chrome terpisah; jam aplikasi pengguna tidak diubah. Lokasi screenshot dicetak di akhir pengujian.

## File

- index.html: login, katalog, formulir detail layanan, keranjang, konfirmasi, Pesanan Saya, dashboard dan konfirmasi reset.
- style.css: palet pink dengan CSS variables dan tampilan desktop/HP.
- app.js: katalog, autentikasi, penyimpanan, stok, slot, layanan, checkout dan antrean.
- tests/campus-flow.cjs: pengujian integrasi melalui Chrome.
- assets/menu-illustrations.png: gambar makanan yang dipertahankan.


