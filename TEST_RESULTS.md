# Hasil pengujian implementasi Antreless

Dijalankan pada 10 Oktober 2026. Tidak memakai kredensial atau transaksi Supabase produksi.

| Pemeriksaan | Hasil | Lingkup |
| --- | --- | --- |
| `npm test` | 16 lulus, 0 gagal | Migrasi/seed asli pada PostgreSQL PGlite, aturan katalog/varian, RLS, grant, role, idempotency, snapshot, status, pembatalan, rollback beberapa kantin, stok dan promo WIB |
| `npm run build` | Lulus | Bundle produksi pada `dist/`; tanpa env menjadi katalog referensi, tanpa checkout online |
| `npm run test:browser` | Lulus | Chrome headless dengan context terpisah, SQL/RLS/RPC asli melalui adapter Auth/PostgREST pengujian |
| Sinkronisasi status lintas sesi | Lulus lokal | Menunggu → diproses → siap → selesai terlihat melalui polling otomatis; tidak refresh manual |
| Formulir admin | Lulus lokal | Membuat kantin, menu, pilihan, promo, serta mengubah stok melalui UI |
| Checkout gagal, retry dan klik ganda | Lulus lokal | Tas dipertahankan saat gagal; satu pesanan dibuat saat retry/klik ganda |
| Layout | Lulus | Tidak overflow horizontal pada lebar 320, 390, 650, 850, 1100, 1440 px; screenshot diperiksa |
| `git diff --check` | Lulus | Tidak ada masalah whitespace |
| `npm run test:online` | Tidak dijalankan | Variabel proyek Supabase staging/akun test belum tersedia; script keluar dengan status NOT RUN |

Screenshot lokal ada di `test-artifacts/` (diabaikan Git): `home-desktop.png`, `catalog-mobile.png`, `admin-desktop.png`, `orders-mobile.png`.

PGlite menyerialkan transaksi lokal; uji lokal tidak membuktikan contention lock pada beberapa koneksi PostgreSQL produksi. Adapter browser tidak menguji keamanan Auth produksi atau koneksi WebSocket Supabase Realtime. Uji tersebut disiapkan pada `tests/online.js` dan perlu dijalankan setelah proyek staging dikonfigurasi. Uji HP/laptop fisik juga masih diperlukan.

Empat foto papan menu tidak tersedia pada lampiran implementasi. Sebanyak 45 menu/58 varian hanya berasal dari transkripsi; seluruh seed belum terverifikasi, nonaktif, stok 0, dan tidak memiliki promo otomatis. Daftar pemeriksaan manusia ada di `MENU_PERLU_KONFIRMASI.md`.

Migrasi belum diterapkan ke proyek Supabase nyata. Status deployment frontend diperiksa terpisah setelah push GitHub; deployment frontend tidak menjalankan migrasi database.

Pembaruan 11 Oktober 2026: deretan kategori bergerak ke kanan secara berulang, tersedia tombol jeda/lanjutkan, berhenti saat hover/fokus, serta mengikuti `prefers-reduced-motion`. Uji browser memeriksa pergerakan, jeda, lanjutkan, dan pengurangan animasi. Gambar/nama menu membuka pop-up rincian berisi varian, harga, lokasi, dan ketersediaan; tombol + tetap langsung menuju alur ringkasan. Pop-up diperiksa pada desktop dan HP tanpa overflow. Seluruh 18 uji logika/database serta suite browser lengkap kembali lulus untuk perubahan ini. Screenshot tambahan: `menu-detail-desktop.png` dan `menu-detail-mobile.png`.
