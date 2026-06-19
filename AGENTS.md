# ARSITEKTUR PLATFORM E-WARGA (MONOREPO SPECIFICATIONS)

Dokumen ini adalah standarisasi aturan arsitektur monorepo, struktur folder, pengelolaan data sensitif, alur status persetujuan, dan peta ekspansi masa depan E-Warga agar dipahami secara instan oleh kecerdasan buatan (AI coding agents) dan kontributor manusia lainnya.

---

## 1. FILOSOFI ARSITEKTUR & SKALABILITAS MASA DEPAN

E-Warga dibangun dengan pendekatan **Monorepo (NPM Workspaces)** untuk memastikan skalabilitas tanpa batas di masa depan. Di masa mendatang, platform ini akan ditambahkan modul-modul penting:
- Dashboard Khusus Kelurahan & Kecamatan (`apps/kecamatan-dashboard`)
- Aplikasi Disdukcapil (`apps/disdukcapil-app`)
- Pos Ronda TV Monitor (`apps/smart-rt-dashboard`)

Oleh karena itu, **ATURAN UTAMA** yang tidak boleh dilanggar:
> **SEMUA LOGIKA UTAMA (Tipe Data, Alur Transisi Surat, Validasi Hak Akses) wajib diisolasi di shared packages (`packages/`), bukan di frontend app.** Hal ini agar logika tersebut dapat dipakai bersama oleh aplikasi masa depan tanpa adanya redudansi kode.

---

## 2. STRUKTUR WORKSPACE MONOREPO
Platform ini terbagi ke dalam ruang kerja berikut:

```text
/tsconfig.json                    # Konfigurasi path compiler global (@e-warga/logic, @e-warga/supabase)
/package.json                     # Root konfigurasi NPM Workspaces
/server.ts                        # Express server penampung API & penyerbu migrasi database
/apps/warga-pwa/                  # Aplikasi PWA Utama (Warga, RT, RW)
  └── src/
      ├── App.tsx                 # Dashboard utama simulasi birokrasi & Pos Ronda Darurat
      └── imageUtils.ts           # Helper kompresor foto KK/KTP (<150KB) sebelum masuk Supabase
/packages/logic/                  # Shared Business Logic Package
  ├── src/
  │   └── index.ts                # Ekspor tipe data, workflow state, status badge, WA Click-to-chat links
  └── package.json
/packages/supabase/               # Shared Database Client Package
  ├── src/
  │   ├── index.ts                # Ekspor database client global instance & helpers
  │   ├── client.ts               # Inisialisasi SupabaseClient lazy-load aman
  │   └── helpers.ts              # SQL Migration executor untuk server container
  └── package.json
```

---

## 3. ALUR WORKFLOW PIPELINE SURAT PENGANTAR (STATE FLOW)
Semua status dikelola secara ketat melalui aturan di `@e-warga/logic`:

1. **`menunggu_rt`**: Dokumen diajukan oleh Warga dan dikirim ke Ketua RT.
2. **`menunggu_rw`**: Disetujui oleh ketua RT dengan membubuhkan nomor surat RT.
3. **`siap_diambil`**: Disetujui oleh Ketua RW dengan membubuhkan nomor surat RW. Warga menerima petunjuk penjemputan berkas basah.
4. **`selesai` / `ditolak_rt` / `ditolak_rw`**: Status akhir setelah penandatanganan sukses atau dokumen ditolak (wajib menyertakan catatan alasan penolakan).

---

## 4. KEAMANAN DATA SENSITIF & SOVEREIGNTY (KEAMANAN ZERO-COST)
Untuk melindungi kedaulatan data warga (menghindari tuntutan hukum kebocoran nomor KK / NIK penuh):
- **Otomasi Kompresi Frontend**: Sebelum gambar KTP/KK diupload ke Supabase Storage, gambar wajib dikompresi di frontend (`imageUtils.ts`) agar berukuran `< 150KB`. Hal ini menghemat ruang gratis 1GB Supabase secara signifikan dan melindungi bandwidth warga.
- **Hukum Tanpa Backend**: Seluruh hak keamanan dijamin langsung oleh **Row Level Security (RLS) PostgreSQL** di tingkat `@e-warga/supabase` menggunakan otentikasi JWT Supabase. Koneksi dicolok langsung dari frontend secara aman tanpa perantara middleware API kustom (Zero Maintenance Cost).

---

## 5. FITUR EKSPANSI MASA DEPAN (SUDAH DIMULAI DI V1.0)

### A. Monetisasi Sponsor & Running Text
Untuk menutup biaya pemeliharaan server secara mandiri tanpa membebankan kas warga kelurahan, aplikasi dipasang **Running Text Ads** di bagian atas PWA. UMKM lokal (Toko kelontong, Fotokopi, Gulai Sate) dapat menyewa slot iklan baris teks berjalan tersebut menggunakan click-to-chat WhatsApp yang dinamis.

### B. Pos Ronda Digital (Darurat Koordinasi Antar-Kampung)
Fitur mitigasi keamanan siskamling jika terjadi aksi pencurian/maling di pemukiman warga:
1. **Tombol Panik (Panic Button)**: Mengubah layar seluruh warga di RT/RW menjadi kelap-kelip merah-biru visual sirene dan membunyikan peringatan darurat.
2. **Kamar Koordinasi Siskamling (Inter-RT/RW Chat)**: Chatbox real-time terintegrasi antar RT, RW, hingga Linmas kelurahan untuk memantau pergerakan maling.
3. **Brikade Gapura Otomatis**: Warga terpilih dapat mengunci pintu portal gapura luar langsung dari satu klik tombol di aplikasi, sehingga melumpuhkan akses gerak maling di jalan keluar masuk perkampungan. Fitur ini dilengkapi AI keyword detector (mengetik *"tutup RT 03"* langsung mengubah status portal brikade menjadi terkunci).

---

## 6. CARA EXTEND CODEBASE SECARA BENAR
- **Menambah Jenis Surat Baru**: Jangan hardcode di `warga-pwa`! Tambahkan opsi baru pada union type `JenisSurat` di `/packages/logic/src/index.ts`.
- **Menambah Query Database Baru**: Tulis definisinya di shared package `/packages/supabase/src/client.ts`.
- **Menjalankan Database Live Anda**: Cukup klik tab **"Supabase Integrasi"** di aplikasi, masukkan URI credentials database Supabase kosong Anda, lalu klik **"Jalankan Auto-Migration"** untuk setup skema tabel & rules RLS secara instan!
