# **PRD Canvas: Template E-commerce "BekasBerkah"**

**Versi 3.0 \- Final | Tujuan: Pembuatan Template Web / Aplikasi Demo Fungsional**

### **1\. Visi & Misi (Sebagai Narasi Template)**

* **Visi:** Menjadi platform jual-beli barang bekas terpercaya di Indonesia yang memberikan nilai ekonomi sekaligus mengurangi limbah konsumtif.  
* **Misi:** "Memberi kehidupan kedua pada barang bekas yang masih layak pakai melalui proses kurasi terpusat yang mudah, aman, dan menguntungkan bagi semua pihak."  
* **Tujuan Proyek Sebenarnya:** **Membangun sebuah template aplikasi e-commerce yang fungsional, interaktif, dan modern. Aplikasi ini berfungsi sebagai demo untuk menunjukkan alur kerja lengkap (Admin & Pengguna) dari sebuah platform barang bekas terkurasi.**

### **2\. Masalah & Solusi (yang Didemonstrasikan)**

*(Narasi ini menjelaskan kapabilitas yang ditunjukkan oleh template).*

| Masalah yang Dihadapi Pengguna | Solusi yang Ditawarkan Template BekasBerkah |
| :---- | :---- |
| **Bagi Penjual:** Proses menjual barang bekas sangat merepotkan. | **Demo Fitur "Jual Mudah":** Template ini akan mendemonstrasikan alur pengajuan barang yang simpel, di mana Admin akan mengurus sisanya. |
| **Bagi Pembeli:** Risiko tertipu dan kualitas tidak terjamin. | **Demo Fitur "Kurasi & Kepercayaan":** Menunjukkan bagaimana sebuah platform bisa menjamin kualitas dengan deskripsi produk yang terstandarisasi oleh Admin. |
| **Masalah Umum:** Banyak barang layak pakai yang terbuang sia-sia. | **Menjadi Contoh Kasus:** Template ini menjadi contoh nyata bagaimana teknologi bisa menjembatani masalah limbah konsumtif. |

### **3\. Target Pengguna**

* **Target Pengguna *Template Ini***:  
  * **Developer:** Yang membutuhkan basis kode (boilerplate) untuk memulai proyek e-commerce serupa.  
  * **Klien Potensial:** Yang ingin melihat demo fungsional dari sebuah aplikasi web sebelum memutuskan untuk membangunnya.  
* **Target Pengguna *yang Disimulasikan dalam Demo***:  
  * **Admin:** Pengelola toko.  
  * **Pembeli:** "Pemburu Cerdas" & "Pencari Barang Unik".  
  * **Penjual:** "Perorangan Sibuk" & "Mitra Gudang".

### **4\. Alur Pengguna Utama (User Journeys untuk Demo)**

*(Seluruh alur ini disimulasikan secara penuh di sisi klien/browser untuk menunjukkan fungsionalitasnya).*

* **Alur Pembelian:** Kunjungi situs \-\> Cari/Filter \-\> Lihat Detail \-\> Tambah ke Keranjang \-\> Checkout \-\> Lihat status pesanan di Halaman Akun.  
* **Alur Penjualan (Pengajuan):** Kunjungi "Jual Barang" \-\> Isi Formulir \-\> Lacak status pengajuan di Halaman Akun.  
* **Alur Admin:** Login ke dashboard \-\> Terima & kelola pengajuan \-\> Tambah & kelola produk \-\> Lihat & proses pesanan masuk.

### **5\. Tahapan Pengembangan & Fitur Utama**

*(Strategi Admin-first sangat cocok untuk membangun demo yang komprehensif).*

#### **Fase 1: Pembangunan Modul Dashboard Admin**

*Tujuan: Membuat demo panel admin yang interaktif dan kaya fitur.*

1. **Dashboard Admin:** Halaman utama.  
2. **Manajemen Produk:** Fitur CRUD lengkap.  
3. **Manajemen Kategori:** Admin dapat mengelola kategori produk.  
4. **Manajemen Pengajuan:** Antarmuka untuk memproses "pengajuan" barang.  
5. **Manajemen Pesanan:** Antarmuka untuk memproses "pesanan" yang masuk.

#### **Fase 2: Pembangunan Modul Etalase Pengguna**

*Tujuan: Membangun demo etalase publik yang menampilkan data dari modul Admin.*

1. **Galeri & Detail Produk:** Menampilkan produk.  
2. **Pencarian & Filter:** Fungsi pencarian interaktif.  
3. **Keranjang Belanja & Checkout:** Alur pembelian yang mulus.  
4. **Formulir Pengajuan Jual Barang:** Form interaktif.  
5. **Halaman Akun Pengguna:** Tempat pengguna melihat simulasi riwayat transaksi.

### **6\. Metrik Kesuksesan (Untuk Proyek Template Ini)**

* **Fungsionalitas:** Semua alur pengguna (Admin & Pembeli) dapat didemonstrasikan dari awal hingga akhir tanpa eror.  
* **Pengalaman Pengguna (UX):** Antarmuka terasa cepat, responsif, dan intuitif. Animasinya mulus.  
* **Kualitas Kode:** Kode bersih, terstruktur dengan baik, mudah dipahami, dan mudah untuk dikustomisasi (menjadi nilai jual utama sebuah template).  
* **Kelengkapan Fitur:** Semua fitur yang dijanjikan dalam deskripsi template berhasil diimplementasikan.

### **7\. Tumpukan Teknologi (Tech Stack)**

| Kategori | Teknologi | Implikasi & Alasan Pemilihan |
| :---- | :---- | :---- |
| **Framework** | Next.js (dengan TypeScript) | Struktur modern, performa UI cepat, dan pengalaman development yang baik. |
| **Database Lokal** | **Dexie.js (Wrapper untuk IndexedDB)** | **Pilihan Sempurna untuk Demo:** Memungkinkan pembuatan prototipe interaktif yang berjalan sepenuhnya di browser, tanpa biaya backend, dan dapat diisi dengan data awal (mock data) untuk keperluan demonstrasi. |
| **Styling & UI** | Tailwind CSS & Shadcn/ui | Kombinasi terbaik untuk pengembangan UI yang cepat dan sangat bisa dikustomisasi. |
| **Deployment** | Vercel | Ideal untuk hosting aplikasi frontend, memberikan URL demo yang bisa diakses publik dengan mudah. |

### **8\. Asumsi & Keterbatasan (Sebagai Template/Demo)**

* **Tujuan Utama:** Aplikasi ini adalah **showcase fungsional**, bukan platform produksi.  
* **Penyimpanan Data:** Seluruh data **bersifat sementara dan disimpan di browser pengguna**. Membersihkan cache browser akan mereset data ke kondisi awal.  
* **Tidak Ada Backend Sungguhan:** Tidak ada sistem otentikasi pengguna yang sebenarnya, pemrosesan pembayaran riil, atau database terpusat. Semua disimulasikan di client-side.  
* **Single-Session:** Aplikasi ini didesain untuk didemonstrasikan dalam satu sesi browser. Data tidak akan tersinkronisasi antar perangkat atau pengguna.