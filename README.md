# Universal Invoice & Nota Studio (Direct to PDF)

Aplikasi web modern, responsif, dan elegan untuk pembuatan nota dan invoice universal dengan fitur **ekspor langsung ke PDF berkualitas tinggi (resolusi cetak A4)** serta antarmuka *live preview real-time* yang terinspirasi dari tata letak estetika *Sleek Dark Luxury (Runey style)*.

---

## ✨ Fitur Utama

1. **Dashboard Daftar Invoice (Home Page):**
   - Menampilkan seluruh daftar nota/invoice yang pernah dibuat dan tersimpan secara persisten di *LocalStorage*.
   - Kartu statistik ringkasan: Total Invoice, Akumulasi Nilai Tagihan, Status Terbayar (*Paid*), dan Menunggu (*Pending*).
   - Fitur pencarian instan berdasarkan No. Invoice, Nama Klien, atau Nama Usaha pengirim.
   - Filter cepat berdasarkan status (*Semua, Paid, Pending, Draft*).
   - Aksi cepat: *Quick PDF Download* langsung dari tabel, Edit, Duplikat Invoice, dan Hapus.

2. **Split-Screen Editor (Form Builder + Real-time Live Preview):**
   - **Sisi Kiri (Form Interaktif):**
     - **Kop Universal (FROM):** Input nama usaha/freelancer, email, alamat, kota, negara, nomor kontak, website, dan NPWP/Tax ID.
     - **Penerima Tagihan (BILL TO):** Input nama klien/perusahaan, email, alamat, dan Tax ID.
     - **Metadata Invoice:** Pengaturan nomor invoice, pemilihan mata uang (IDR, USD, EUR, GBP, SGD), tanggal terbit, dan jatuh tempo.
     - **Rincian Barang & Jasa:** Tambah atau hapus baris item secara dinamis dengan auto-kalkulasi per baris.
     - **Kalkulasi Pajak & Diskon:** Input persentase pajak (misal 15% atau 11% PPN) dan diskon.
     - **Detail Pembayaran:** Input metode pembayaran, nama bank, nomor rekening, dan kode routing/SWIFT.
     - **Catatan & Watermark:** Pesan penutup untuk klien dan teks *brand* di bagian bawah.
     - **Lampiran Foto Bukti / Struk (Attachments):** Unggah banyak foto sekaligus (nota bensin, tiket tol, parkir, struk makan tim, dsb.) dengan auto-kompresi gambar cerdas agar file ringan dan hemat memori, dilengkapi input keterangan dan nominal per struk.
   - **Sisi Kanan (Live Preview):**
     - Pratinjau langsung berstandar rasio A4 yang responsif secara *real-time* saat formulir di sisi kiri diisi.
     - Banner lengkung *fluid abstract neon wave* yang elegan (sesuai referensi desain).
     - Bagian lampiran foto struk/nota tersusun rapi di lembar invoice dengan fitur *Lightbox* (klik untuk memperbesar gambar).

3. **Ekspor Langsung ke PDF (Direct PDF Engine):**
   - Menggunakan engine *client-side* `html2pdf.js` dengan resolusi tinggi (skala 2.5x).
   - Menghasilkan file PDF proporsional ukuran A4 portrait tanpa elemen UI aplikasi yang terpotong.
   - Dukungan *Print Native* (`@media print`) untuk pencetakan langsung melalui dialog sistem macOS/Windows.

---

## 📁 Struktur Folder Proyek

```text
Aphi Invoice/
├── index.html               # Halaman utama (Dashboard & Split Editor)
├── css/
│   └── style.css            # Styling kustom, scrollbar modern, & konfigurasi @media print
├── js/
│   ├── calculations.js      # Format multi-currency & kalkulasi matematika invoice
│   ├── state.js             # Manajemen state & penyimpanan persisten LocalStorage
│   ├── pdf-export.js        # Engine generator PDF resolusi tinggi & notifikasi toast
│   └── app.js               # Kontroller UI, data binding form, & render live preview
├── assets/
│   ├── banner-wave.svg      # Vektor banner fluid wave (sesuai referensi desain)
│   └── banner-minimal.svg   # Alternatif vektor banner minimalis
├── .gitignore
└── README.md
```

---

## 🚀 Cara Menjalankan

Aplikasi ini dirancang *zero-dependency* (tanpa perlu proses `npm build` atau kompilasi server yang rumit). Cukup:

1. **Buka Langsung:**
   - Buka file `index.html` langsung di browser Chrome, Safari, atau Edge favorit Anda.
2. **Atau Menggunakan Local Server (Opsional):**
   ```bash
   # Menggunakan Python
   python3 -m http.server 3000
   
   # Lalu buka di browser: http://localhost:3000
   ```

---

## 🌐 Deployment GitHub Pages

Karena dibangun sebagai *Single-Page Web Application* murni, proyek ini dapat di-host langsung secara gratis di GitHub Pages:
1. Buka repositori `https://github.com/alfinradidty14/Aphi-Invoice` di GitHub.
2. Masuk ke menu **Settings** > **Pages**.
3. Pada opsi **Branch**, pilih `main` dan folder `/ (root)`.
4. Klik **Save**. Web nota PDF Anda akan langsung aktif dalam hitungan detik!
