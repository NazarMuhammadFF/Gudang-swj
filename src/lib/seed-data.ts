import { db } from "./database";
import type { Product, Category, Submission, Order } from "./database";
import { generateSubmissionCode } from "./tracking";

// Helper function to get random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper to generate random order number
const generateOrderNumber = () => {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};


// Categories data
const categoriesData: Omit<Category, "id">[] = [
  {
    name: "Elektronik",
    description:
      "Perangkat elektronik seperti smartphone, laptop, dan gadget lainnya",
    createdAt: new Date("2024-01-15"),
  },
  {
    name: "Furniture",
    description: "Mebel dan perabotan rumah tangga berkualitas",
    createdAt: new Date("2024-01-16"),
  },
  {
    name: "Fashion",
    description: "Pakaian, sepatu, dan aksesori fashion pria dan wanita",
    createdAt: new Date("2024-01-17"),
  },
  {
    name: "Buku",
    description: "Buku bekas berbagai genre dan kategori",
    createdAt: new Date("2024-01-18"),
  },
  {
    name: "Olahraga",
    description: "Peralatan dan perlengkapan olahraga",
    createdAt: new Date("2024-01-19"),
  },
  {
    name: "Hobi & Koleksi",
    description: "Barang koleksi, mainan, dan perlengkapan hobi",
    createdAt: new Date("2024-01-20"),
  },
  {
    name: "Otomotif",
    description: "Aksesori dan spare part kendaraan",
    createdAt: new Date("2024-01-21"),
  },
  {
    name: "Alat Musik",
    description: "Alat musik dan aksesori musik",
    createdAt: new Date("2024-01-22"),
  },
];

// Products data - diverse and realistic
const productsData: Omit<Product, "id">[] = [
  // Elektronik
  {
    name: "iPhone 12 Pro 128GB",
    description:
      "iPhone 12 Pro kondisi mulus 95%, fullset box, charger, kabel. No minus, baterai health 89%.",
    price: 8500000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1603891135081-6d0c70a4c384?w=400",
    status: "active",
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-09-15"),
  },
  {
    name: "Samsung Galaxy S21 256GB",
    description:
      "Samsung S21 warna Phantom Gray, kondisi 90%, lengkap dengan box dan aksesoris original.",
    price: 6200000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    status: "active",
    createdAt: new Date("2024-09-18"),
    updatedAt: new Date("2024-09-18"),
  },
  {
    name: "MacBook Air M1 2020",
    description:
      "MacBook Air M1 8GB/256GB Space Gray, kondisi sangat mulus, garansi resun aktif sampai Juni 2025.",
    price: 11500000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    status: "active",
    createdAt: new Date("2024-09-20"),
    updatedAt: new Date("2024-09-20"),
  },
  {
    name: "iPad Air 4th Gen 64GB WiFi",
    description:
      "iPad Air 4 warna Sky Blue, like new condition, fullset dengan Apple Pencil Gen 2.",
    price: 7200000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    status: "active",
    createdAt: new Date("2024-09-25"),
    updatedAt: new Date("2024-09-25"),
  },
  {
    name: "Sony WH-1000XM4 Wireless Headphones",
    description:
      "Headphone noise cancelling terbaik, kondisi 95%, lengkap dengan case dan kabel.",
    price: 3200000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
    status: "active",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
  },
  {
    name: "Nintendo Switch OLED",
    description:
      "Switch OLED White edition, mulus terawat, bonus 3 game fisik (Pokemon, Mario Kart, Zelda).",
    price: 4800000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
    status: "active",
    createdAt: new Date("2024-10-03"),
    updatedAt: new Date("2024-10-03"),
  },
  {
    name: "Canon EOS M50 Kit 15-45mm",
    description:
      "Kamera mirrorless Canon M50, shutter count rendah 2000an, fullset bonus tas dan memory 64GB.",
    price: 6800000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    status: "active",
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-05"),
  },
  {
    name: "Kindle Paperwhite 11th Gen",
    description:
      "E-reader Kindle terbaru dengan layar 6.8 inch, 16GB storage, waterproof, seperti baru.",
    price: 1850000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1592843586116-5099ec049dfa?w=400",
    status: "active",
    createdAt: new Date("2024-10-07"),
    updatedAt: new Date("2024-10-07"),
  },

  // Furniture
  {
    name: "Sofa Minimalis 3 Seater",
    description:
      "Sofa minimalis modern warna abu-abu, bahan fabric premium, kondisi 90%, sangat nyaman.",
    price: 3500000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    status: "active",
    createdAt: new Date("2024-09-10"),
    updatedAt: new Date("2024-09-10"),
  },
  {
    name: "Meja Kerja Kayu Jati Standing Desk",
    description:
      "Standing desk elektrik kayu jati solid, adjustable height, ukuran 120x60cm, mulus seperti baru.",
    price: 4200000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
    status: "active",
    createdAt: new Date("2024-09-12"),
    updatedAt: new Date("2024-09-12"),
  },
  {
    name: "Herman Miller Aeron Chair Size B",
    description:
      "Kursi kantor ergonomis legendary, kondisi 85%, semua fungsi normal, nyaman untuk 8 jam kerja.",
    price: 8500000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
    status: "active",
    createdAt: new Date("2024-09-22"),
    updatedAt: new Date("2024-09-22"),
  },
  {
    name: "Rak Buku Industrial Besi & Kayu",
    description:
      "Rak buku gaya industrial 5 tingkat, kombinasi besi hitam dan kayu jati, kokoh dan stylish.",
    price: 2100000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
    status: "active",
    createdAt: new Date("2024-09-28"),
    updatedAt: new Date("2024-09-28"),
  },
  {
    name: "Lemari Pakaian 3 Pintu Jati",
    description:
      "Lemari kayu jati solid 3 pintu dengan cermin, desain klasik elegan, kondisi terawat.",
    price: 5500000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
    status: "active",
    createdAt: new Date("2024-10-02"),
    updatedAt: new Date("2024-10-02"),
  },

  // Fashion
  {
    name: "Nike Air Jordan 1 Mid Chicago",
    description:
      "Sepatu sneakers original Nike AJ1 Mid, size 42, kondisi 9/10, box original lengkap.",
    price: 1850000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    status: "active",
    createdAt: new Date("2024-09-16"),
    updatedAt: new Date("2024-09-16"),
  },
  {
    name: "Levi's 501 Original Jeans",
    description:
      "Celana jeans Levi's 501 classic fit, size 32, warna dark blue, kondisi seperti baru.",
    price: 650000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    status: "active",
    createdAt: new Date("2024-09-19"),
    updatedAt: new Date("2024-09-19"),
  },
  {
    name: "Tas Ransel Fjallraven Kanken Classic",
    description:
      "Tas ransel iconic Sweden, warna kuning mustard, kondisi mulus, waterproof dan awet.",
    price: 950000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    status: "active",
    createdAt: new Date("2024-09-24"),
    updatedAt: new Date("2024-09-24"),
  },
  {
    name: "Ray-Ban Wayfarer Sunglasses",
    description:
      "Kacamata hitam original Ray-Ban Wayfarer classic black, lengkap dengan case dan cloth.",
    price: 1200000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    status: "active",
    createdAt: new Date("2024-09-30"),
    updatedAt: new Date("2024-09-30"),
  },
  {
    name: "Uniqlo Down Jacket Hitam",
    description:
      "Jaket winter Uniqlo ultra light down, size L, sangat hangat dan ringan, cocok untuk traveling.",
    price: 480000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    status: "active",
    createdAt: new Date("2024-10-04"),
    updatedAt: new Date("2024-10-04"),
  },

  // Buku
  {
    name: "Atomic Habits by James Clear",
    description:
      "Buku self-improvement bestseller, kondisi seperti baru, edisi bahasa Indonesia.",
    price: 65000,
    category: "Buku",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    status: "active",
    createdAt: new Date("2024-09-11"),
    updatedAt: new Date("2024-09-11"),
  },
  {
    name: "Harry Potter Complete Set (7 Books)",
    description:
      "Set lengkap Harry Potter bahasa Inggris, kondisi bagus, cover original semua.",
    price: 850000,
    category: "Buku",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    status: "active",
    createdAt: new Date("2024-09-14"),
    updatedAt: new Date("2024-09-14"),
  },
  {
    name: "The Psychology of Money",
    description:
      "Buku finance klasik Morgan Housel, kondisi 95%, banyak highlight dan notes.",
    price: 70000,
    category: "Buku",
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
    status: "active",
    createdAt: new Date("2024-09-21"),
    updatedAt: new Date("2024-09-21"),
  },
  {
    name: "Sapiens: A Brief History of Humankind",
    description:
      "Buku sejarah manusia oleh Yuval Noah Harari, edisi hardcover English, like new.",
    price: 180000,
    category: "Buku",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    status: "active",
    createdAt: new Date("2024-09-27"),
    updatedAt: new Date("2024-09-27"),
  },

  // Olahraga
  {
    name: "Raket Badminton Yonex Astrox 88D Pro",
    description:
      "Raket badminton profesional, kondisi mulus, sudah di-string dengan senar JP 65, bonus grip.",
    price: 1950000,
    category: "Olahraga",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400",
    status: "active",
    createdAt: new Date("2024-09-13"),
    updatedAt: new Date("2024-09-13"),
  },
  {
    name: "Dumbbell Set 20kg (2x10kg)",
    description:
      "Set dumbbell adjustable total 20kg, besi coating, bonus karet pelindung lantai.",
    price: 850000,
    category: "Olahraga",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    status: "active",
    createdAt: new Date("2024-09-17"),
    updatedAt: new Date("2024-09-17"),
  },
  {
    name: "Sepeda Lipat Polygon Urbano 3.0",
    description:
      "Sepeda lipat 20 inch, 7 speed Shimano, kondisi terawat, siap pakai, bonus lampu depan belakang.",
    price: 3200000,
    category: "Olahraga",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
    status: "active",
    createdAt: new Date("2024-09-26"),
    updatedAt: new Date("2024-09-26"),
  },
  {
    name: "Yoga Mat Premium NBR 10mm",
    description:
      "Matras yoga tebal 10mm, anti-slip, lengkap dengan tas carrying case, warna ungu.",
    price: 280000,
    category: "Olahraga",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    status: "active",
    createdAt: new Date("2024-10-06"),
    updatedAt: new Date("2024-10-06"),
  },

  // Hobi & Koleksi
  {
    name: "LEGO Star Wars Millennium Falcon",
    description:
      "LEGO Star Wars set 75192, 7500+ pieces, complete dengan box dan manual, kondisi sempurna.",
    price: 12500000,
    category: "Hobi & Koleksi",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
    status: "active",
    createdAt: new Date("2024-09-08"),
    updatedAt: new Date("2024-09-08"),
  },
  {
    name: "Funko Pop Marvel Avengers Set (6 pcs)",
    description:
      "Set Funko Pop Avengers: Iron Man, Captain America, Thor, Hulk, Black Widow, Hawkeye. Mint condition.",
    price: 1800000,
    category: "Hobi & Koleksi",
    image: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400",
    status: "active",
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    name: "Gundam PG Unicorn Gundam",
    description:
      "Perfect Grade Gundam Unicorn, sudah dirakit dengan rapi, bonus LED unit, display quality.",
    price: 3500000,
    category: "Hobi & Koleksi",
    image: "https://images.unsplash.com/photo-1606041011872-596597976b25?w=400",
    status: "active",
    createdAt: new Date("2024-10-08"),
    updatedAt: new Date("2024-10-08"),
  },

  // Otomotif
  {
    name: "Dashcam 70mai A500S 4K",
    description:
      "Dashcam 4K dengan GPS dan parking mode, kondisi mulus, lengkap dengan memory card 128GB.",
    price: 1650000,
    category: "Otomotif",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400",
    status: "active",
    createdAt: new Date("2024-09-29"),
    updatedAt: new Date("2024-09-29"),
  },
  {
    name: "Car Vacuum Cleaner Xiaomi",
    description:
      "Vacuum cleaner portable untuk mobil, wireless, suction power kuat, bonus nozzle set.",
    price: 450000,
    category: "Otomotif",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400",
    status: "active",
    createdAt: new Date("2024-10-09"),
    updatedAt: new Date("2024-10-09"),
  },

  // Alat Musik
  {
    name: "Gitar Akustik Yamaha F310",
    description:
      "Gitar akustik pemula terbaik, kondisi 90%, suara jernih, bonus softcase dan capo.",
    price: 1350000,
    category: "Alat Musik",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
    status: "active",
    createdAt: new Date("2024-09-09"),
    updatedAt: new Date("2024-09-09"),
  },
  {
    name: "Keyboard Yamaha PSR-E373",
    description:
      "Keyboard 61 keys dengan touch response, 622 voices, kondisi mulus lengkap dengan stand.",
    price: 2800000,
    category: "Alat Musik",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    status: "active",
    createdAt: new Date("2024-09-31"),
    updatedAt: new Date("2024-09-31"),
  },
  {
    name: "Ukulele Soprano Mahalo",
    description:
      "Ukulele soprano ukuran standard, warna natural wood, cocok untuk pemula, bonus bag.",
    price: 480000,
    category: "Alat Musik",
    image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
    status: "active",
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },

  // More products for variety
  {
    name: "PlayStation 5 Digital Edition",
    description:
      "PS5 Digital Edition, kondisi mulus 98%, garansi resmi masih panjang, bonus 2 game digital.",
    price: 6500000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
    status: "active",
    createdAt: new Date("2024-10-11"),
    updatedAt: new Date("2024-10-11"),
  },
  {
    name: "Apple Watch Series 8 GPS 45mm",
    description:
      "Apple Watch S8 Midnight aluminum, kondisi like new, fullset dengan charger dan box.",
    price: 5200000,
    category: "Elektronik",
    image: "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=400",
    status: "active",
    createdAt: new Date("2024-10-12"),
    updatedAt: new Date("2024-10-12"),
  },
  {
    name: "Kursi Gaming Rexus RGC 103",
    description:
      "Kursi gaming ergonomis dengan lumbar support, recline 180 derajat, warna hitam merah.",
    price: 1950000,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400",
    status: "active",
    createdAt: new Date("2024-10-11"),
    updatedAt: new Date("2024-10-11"),
  },
  {
    name: "Adidas Ultraboost 22 Running Shoes",
    description:
      "Sepatu lari premium Adidas, size 43, kondisi 85%, sangat nyaman untuk long distance running.",
    price: 1250000,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400",
    status: "active",
    createdAt: new Date("2024-10-12"),
    updatedAt: new Date("2024-10-12"),
  },
];

// Submissions data
const submissionsData: Omit<Submission, "id">[] = [
  {
    sellerName: "Budi Santoso",
    email: "budi.santoso@gmail.com",
    phone: "081234567890",
    sellerCity: "Jakarta",
    sellerAddress: "Jl. Jenderal Sudirman No. 10, Jakarta Pusat",
    preferredContact: "whatsapp",
    productName: "MacBook Pro 2019 15 inch",
    productDescription:
      "MacBook Pro 2019 i7, RAM 16GB, SSD 512GB. Kondisi 95%, baterai health 87%.",
    category: "Elektronik",
    condition: "excellent",
    askingPrice: 16500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes: "Laptop masih garansi, fullset dengan box dan charger original",
    createdAt: randomDate(new Date(2024, 9, 1), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 1), new Date()),
  },
  {
    sellerName: "Siti Nurhaliza",
    email: "siti.nur@yahoo.com",
    phone: "082345678901",
    sellerCity: "Bandung",
    sellerAddress: "Jl. Setiabudi No. 22, Kota Bandung",
    preferredContact: "email",
    productName: "Sofa L-Shape Minimalis Abu-abu",
    productDescription:
      "Sofa L-Shape bahan suede, kursi 3+2. Kondisi bersih, baru dipakai 1 tahun.",
    category: "Furniture",
    condition: "good",
    askingPrice: 4500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes: "Sofa ukuran besar 3x2 meter, kondisi bersih terawat",
    createdAt: randomDate(new Date(2024, 8, 15), new Date()),
    updatedAt: randomDate(new Date(2024, 8, 20), new Date()),
  },
  {
    sellerName: "Ahmad Rizki",
    email: "rizki.ahmad@gmail.com",
    phone: "083456789012",
    sellerCity: "Surabaya",
    sellerAddress: "Jl. Darmo Permai IV Blok B 5, Surabaya",
    preferredContact: "phone",
    productName: "Sepeda MTB Polygon Xtrada 5",
    productDescription:
      "Sepeda gunung Polygon ukuran 27.5, sudah servis rutin. Cocok untuk pemula.",
    category: "Olahraga",
    condition: "fair",
    askingPrice: 3500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1595438813517-5c84b964d6af?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "rejected",
    notes: "Sepeda sudah tua, banyak komponen yang perlu diganti",
    createdAt: randomDate(new Date(2024, 8, 10), new Date()),
    updatedAt: randomDate(new Date(2024, 8, 12), new Date()),
  },
  {
    sellerName: "Dewi Lestari",
    email: "dewi.lestari@outlook.com",
    phone: "084567890123",
    sellerCity: "Jakarta",
    sellerAddress: "Jl. Kemang Raya No. 5, Jakarta Selatan",
    preferredContact: "whatsapp",
    productName: "Tas Hermes Birkin (Replica)",
    productDescription:
      "Tas replika kualitas premium, kondisi baru 2x pakai, lengkap dengan dustbag.",
    category: "Fashion",
    condition: "excellent",
    askingPrice: 2500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "rejected",
    notes: "Maaf, kami tidak menerima barang replika/tiruan",
    createdAt: randomDate(new Date(2024, 9, 5), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 6), new Date()),
  },
  {
    sellerName: "Andi Wijaya",
    email: "andi.w@gmail.com",
    phone: "085678901234",
    sellerCity: "Yogyakarta",
    sellerAddress: "Jl. Kaliurang Km 6 No. 12, Sleman",
    preferredContact: "whatsapp",
    productName: "iPad Pro 2021 11 inch M1 256GB",
    productDescription:
      "iPad Pro Wi-Fi, Battery Health 92%, include Magic Keyboard dan Apple Pencil.",
    category: "Elektronik",
    condition: "excellent",
    askingPrice: 11000000,
    productPhotos: [
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes:
      "iPad mulus seperti baru, lengkap dengan Magic Keyboard dan Apple Pencil 2",
    createdAt: randomDate(new Date(2024, 9, 8), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 10), new Date()),
  },
  {
    sellerName: "Rina Kusuma",
    email: "rina.kusuma@gmail.com",
    phone: "086789012345",
    sellerCity: "Semarang",
    sellerAddress: "Jl. Ahmad Yani No. 45, Semarang",
    preferredContact: "email",
    productName: "Koleksi Buku Novel Tere Liye (15 buku)",
    productDescription:
      "Paket 15 novel Tere Liye edisi hardcover, kondisi bersih terawat.",
    category: "Buku",
    condition: "good",
    askingPrice: 950000,
    productPhotos: [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes: "Koleksi lengkap novel Tere Liye, kondisi bagus semua",
    createdAt: randomDate(new Date(2024, 9, 11), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 11), new Date()),
  },
  {
    sellerName: "Fajar Ramadhan",
    email: "fajar.r@yahoo.com",
    phone: "087890123456",
    sellerCity: "Depok",
    sellerAddress: "Perumahan Griya Cinere Blok C2 No. 7, Depok",
    preferredContact: "phone",
    productName: "Meja Belajar Kayu Jati + Kursi",
    productDescription:
      "Set meja belajar kayu jati custom dengan laci, finishing natural.",
    category: "Furniture",
    condition: "excellent",
    askingPrice: 2800000,
    productPhotos: [
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes: "Set meja belajar kayu jati solid, sangat kokoh dan awet",
    createdAt: randomDate(new Date(2024, 9, 3), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 4), new Date()),
  },
  {
    sellerName: "Linda Permata",
    email: "linda.permata@gmail.com",
    phone: "088901234567",
    sellerCity: "Jakarta",
    sellerAddress: "Jl. Puri Kencana No. 8, Kembangan",
    preferredContact: "whatsapp",
    productName: "Kamera Sony A7 III Body Only",
    productDescription:
      "Kamera mirrorless full-frame, shutter count 5.100. Include 2 baterai.",
    category: "Elektronik",
    condition: "excellent",
    askingPrice: 16500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes:
      "Kamera fullframe Sony, shutter count 5000, lengkap box dan aksesoris",
    createdAt: randomDate(new Date(2024, 9, 12), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 12), new Date()),
  },
  {
    sellerName: "Hendra Gunawan",
    email: "hendra.gun@outlook.com",
    phone: "089012345678",
    sellerCity: "Bandung",
    sellerAddress: "Jl. Ciumbuleuit No. 18, Bandung",
    preferredContact: "whatsapp",
    productName: "Raket Tenis Wilson Pro Staff",
    productDescription:
      "Raket tenis original Wilson, dipakai 6 bulan, include tas raket.",
    category: "Olahraga",
    condition: "good",
    askingPrice: 2200000,
    productPhotos: [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes: "Raket tenis profesional, sudah di-string, kondisi normal usage",
    createdAt: randomDate(new Date(2024, 9, 7), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 9), new Date()),
  },
  {
    sellerName: "Mega Sari",
    email: "mega.sari@gmail.com",
    phone: "081122334455",
    sellerCity: "Surabaya",
    sellerAddress: "Jl. Raya Darmo Indah Blok A3 No. 4, Surabaya",
    preferredContact: "phone",
    productName: "Sepatu Nike Air Max 90",
    productDescription:
      "Sepatu sneakers original Nike Air Max 90, size 39 EU, warna triple white.",
    category: "Fashion",
    condition: "good",
    askingPrice: 1200000,
    productPhotos: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes: "Sepatu original Nike, size 39, kondisi 8/10, box hilang",
    createdAt: randomDate(new Date(2024, 9, 13), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 13), new Date()),
  },
  {
    sellerName: "Dimas Prasetyo",
    email: "dimas.p@yahoo.com",
    phone: "082233445566",
    sellerCity: "Jakarta",
    sellerAddress: "Apartemen Sudirman Park Tower B No. 1208",
    preferredContact: "email",
    productName: "Action Figure Hot Toys Iron Man Mark 50",
    productDescription:
      "Hot Toys MMS473 Iron Man Mark 50, kondisi MISB lengkap dengan shipper box.",
    category: "Hobi & Koleksi",
    condition: "excellent",
    askingPrice: 6500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes: "Hot Toys sealed MISB (Mint in Sealed Box), collector item",
    createdAt: randomDate(new Date(2024, 9, 6), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date()),
  },
  {
    sellerName: "Tari Wulandari",
    email: "tari.wulan@gmail.com",
    phone: "083344556677",
    sellerCity: "Bekasi",
    sellerAddress: "Jl. Sultan Agung No. 88, Bekasi Barat",
    preferredContact: "whatsapp",
    productName: "Lemari Pakaian Sliding Door 2 Pintu",
    productDescription:
      "Lemari pakaian bahan plywood finishing HPL, door sliding dengan cermin besar.",
    category: "Furniture",
    condition: "good",
    askingPrice: 3200000,
    productPhotos: [
      "https://images.unsplash.com/photo-1616628182506-9b41d20b48d6?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes: "Lemari sliding door cermin, ukuran 150x200cm, ada sedikit goresan",
    createdAt: randomDate(new Date(2024, 9, 10), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 10), new Date()),
  },
  {
    sellerName: "Yoga Pratama",
    email: "yoga.pratama@outlook.com",
    phone: "084455667788",
    sellerCity: "Malang",
    sellerAddress: "Jl. Ijen Nirwana Blok D3 No. 6, Malang",
    preferredContact: "whatsapp",
    productName: "Gitar Elektrik Fender Stratocaster",
    productDescription:
      "Fender Stratocaster made in Mexico 2018, include hardcase dan strap original.",
    category: "Alat Musik",
    condition: "excellent",
    askingPrice: 12500000,
    productPhotos: [
      "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes:
      "Gitar Fender Mexico, kondisi mulus, case hardcase, bonus ampli kecil",
    createdAt: randomDate(new Date(2024, 9, 2), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 3), new Date()),
  },
  {
    sellerName: "Putri Ayu",
    email: "putri.ayu@gmail.com",
    phone: "085566778899",
    sellerCity: "Jakarta",
    sellerAddress: "Jl. Senopati No. 25, Jakarta Selatan",
    preferredContact: "whatsapp",
    productName: "Tas Coach Original Crossbody",
    productDescription:
      "Tas Coach crossbody warna tan, import dari outlet USA, kondisi mulus.",
    category: "Fashion",
    condition: "excellent",
    askingPrice: 2750000,
    productPhotos: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "pending",
    notes: "Tas Coach original beli dari USA, lengkap dengan dust bag dan card",
    createdAt: randomDate(new Date(2024, 9, 12), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 12), new Date()),
  },
  {
    sellerName: "Rizal Hidayat",
    email: "rizal.h@yahoo.com",
    phone: "086677889900",
    sellerCity: "Tangerang",
    sellerAddress: "Jl. Boulevard Gading Serpong No. 1",
    preferredContact: "email",
    productName: "Monitor Gaming ASUS ROG 27 inch 165Hz",
    productDescription:
      "Monitor gaming ASUS ROG Swift 27 inch 2K 165Hz, include box dan kabel lengkap.",
    category: "Elektronik",
    condition: "excellent",
    askingPrice: 6800000,
    productPhotos: [
      "https://images.unsplash.com/photo-1587202372775-98927aca1c84?w=400",
    ],
    trackingCode: generateSubmissionCode(),
    status: "approved",
    notes: "Monitor gaming IPS 1440p 165Hz, no dead pixel, fullset",
    createdAt: randomDate(new Date(2024, 8, 28), new Date()),
    updatedAt: randomDate(new Date(2024, 8, 30), new Date()),
  },
];

// Orders data
const ordersData: Omit<Order, "id">[] = [
  {
    orderNumber: generateOrderNumber(),
    customerName: "Rina Kusuma",
    customerEmail: "rina.kusuma@gmail.com",
    customerPhone: "0821-4567-8901",
    shippingAddress: "Jl. Ahmad Yani No. 45, Semarang",
    items: [
      {
        productId: 12,
        productName: "Kamera Sony A7 III Body Only",
        price: 16500000,
        quantity: 1,
      },
      {
        productId: 5,
        productName: "Sony WH-1000XM4 Wireless Headphones",
        price: 3200000,
        quantity: 1,
      },
    ],
    totalAmount: 19700000,
    status: "delivered",
    paymentMethod: "E-Wallet",
    notes: "Diterima langsung di rumah oleh pelanggan",
    createdAt: randomDate(new Date(2024, 8, 20), new Date(2024, 8, 28)),
    updatedAt: randomDate(new Date(2024, 8, 29), new Date(2024, 9, 2)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Rina Kusuma",
    customerEmail: "rina.kusuma@gmail.com",
    customerPhone: "0821-4567-8901",
    shippingAddress: "Jl. Ahmad Yani No. 45, Semarang",
    items: [
      {
        productId: 27,
        productName: "Sepatu Nike Air Max 90",
        price: 1200000,
        quantity: 1,
      },
      {
        productId: 44,
        productName: "Tas Coach Original Crossbody",
        price: 2750000,
        quantity: 1,
      },
    ],
    totalAmount: 3950000,
    status: "shipped",
    paymentMethod: "Transfer Bank",
    notes: "Dalam proses pengiriman via kurir JNE",
    createdAt: randomDate(new Date(2024, 9, 10), new Date(2024, 9, 14)),
    updatedAt: randomDate(new Date(2024, 9, 15), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Agus Setiawan",
    email: "agus.setiawan@gmail.com",
    total: 8500000,
    status: "delivered",
    itemsDescription: "iPhone 12 Pro 128GB",
    createdAt: randomDate(new Date(2024, 8, 1), new Date(2024, 8, 15)),
    updatedAt: randomDate(new Date(2024, 8, 20), new Date(2024, 8, 25)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Sinta Dewi",
    email: "sinta.d@yahoo.com",
    total: 3500000,
    status: "delivered",
    itemsDescription: "Sofa Minimalis 3 Seater",
    createdAt: randomDate(new Date(2024, 8, 5), new Date(2024, 8, 10)),
    updatedAt: randomDate(new Date(2024, 8, 15), new Date(2024, 8, 20)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Bambang Kusuma",
    email: "bambang.k@gmail.com",
    total: 11500000,
    status: "shipped",
    itemsDescription: "MacBook Air M1 2020",
    createdAt: randomDate(new Date(2024, 9, 1), new Date(2024, 9, 5)),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Diana Maharani",
    email: "diana.m@outlook.com",
    total: 1850000,
    status: "processing",
    itemsDescription: "Nike Air Jordan 1 Mid Chicago (Size 42)",
    createdAt: randomDate(new Date(2024, 9, 8), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 10), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Eko Prasetyo",
    email: "eko.p@gmail.com",
    total: 6800000,
    status: "pending",
    itemsDescription: "Canon EOS M50 Kit 15-45mm",
    createdAt: randomDate(new Date(2024, 9, 11), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 11), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Fitri Handayani",
    email: "fitri.h@yahoo.com",
    total: 4200000,
    status: "delivered",
    itemsDescription: "Meja Kerja Kayu Jati Standing Desk",
    createdAt: randomDate(new Date(2024, 8, 15), new Date(2024, 8, 20)),
    updatedAt: randomDate(new Date(2024, 8, 28), new Date(2024, 9, 2)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Gita Savitri",
    email: "gita.s@gmail.com",
    total: 3200000,
    status: "delivered",
    itemsDescription: "Sony WH-1000XM4 Wireless Headphones",
    createdAt: randomDate(new Date(2024, 9, 2), new Date(2024, 9, 4)),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date(2024, 9, 10)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Hadi Wijaya",
    email: "hadi.w@outlook.com",
    total: 7200000,
    status: "shipped",
    itemsDescription: "iPad Air 4th Gen 64GB WiFi + Apple Pencil Gen 2",
    createdAt: randomDate(new Date(2024, 9, 7), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 9), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Indah Permatasari",
    email: "indah.p@gmail.com",
    total: 950000,
    status: "processing",
    itemsDescription: "Tas Ransel Fjallraven Kanken Classic Yellow",
    createdAt: randomDate(new Date(2024, 9, 9), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 10), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Joko Santoso",
    email: "joko.s@yahoo.com",
    total: 12500000,
    status: "cancelled",
    itemsDescription: "LEGO Star Wars Millennium Falcon",
    createdAt: randomDate(new Date(2024, 9, 5), new Date(2024, 9, 7)),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Kartika Sari",
    email: "kartika.sari@gmail.com",
    total: 850000,
    status: "delivered",
    itemsDescription: "Harry Potter Complete Set (7 Books)",
    createdAt: randomDate(new Date(2024, 8, 20), new Date(2024, 8, 25)),
    updatedAt: randomDate(new Date(2024, 9, 1), new Date(2024, 9, 5)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Lukman Hakim",
    email: "lukman.h@outlook.com",
    total: 8500000,
    status: "delivered",
    itemsDescription: "Herman Miller Aeron Chair Size B",
    createdAt: randomDate(new Date(2024, 8, 25), new Date(2024, 9, 1)),
    updatedAt: randomDate(new Date(2024, 9, 5), new Date(2024, 9, 8)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Maya Angelina",
    email: "maya.a@gmail.com",
    total: 1950000,
    status: "shipped",
    itemsDescription: "Raket Badminton Yonex Astrox 88D Pro",
    createdAt: randomDate(new Date(2024, 9, 6), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Nanda Pratama",
    email: "nanda.p@yahoo.com",
    total: 4800000,
    status: "processing",
    itemsDescription: "Nintendo Switch OLED + 3 Games",
    createdAt: randomDate(new Date(2024, 9, 10), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 11), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Omar Abdullah",
    email: "omar.a@gmail.com",
    total: 650000,
    status: "pending",
    itemsDescription: "Levi's 501 Original Jeans Size 32",
    createdAt: randomDate(new Date(2024, 9, 12), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 12), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Rani Mulyani",
    email: "rani.m@outlook.com",
    total: 2100000,
    status: "delivered",
    itemsDescription: "Rak Buku Industrial Besi & Kayu",
    createdAt: randomDate(new Date(2024, 9, 1), new Date(2024, 9, 3)),
    updatedAt: randomDate(new Date(2024, 9, 7), new Date(2024, 9, 10)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Surya Dharma",
    email: "surya.d@gmail.com",
    total: 1200000,
    status: "delivered",
    itemsDescription: "Ray-Ban Wayfarer Sunglasses Black",
    createdAt: randomDate(new Date(2024, 9, 3), new Date(2024, 9, 5)),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date(2024, 9, 11)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Tina Mariana",
    email: "tina.m@yahoo.com",
    total: 1350000,
    status: "shipped",
    itemsDescription: "Gitar Akustik Yamaha F310 + Softcase",
    createdAt: randomDate(new Date(2024, 9, 8), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 10), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Umar Bakri",
    email: "umar.b@gmail.com",
    total: 3200000,
    status: "processing",
    itemsDescription: "Sepeda Lipat Polygon Urbano 3.0",
    createdAt: randomDate(new Date(2024, 9, 11), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 12), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Vina Candrika",
    email: "vina.c@outlook.com",
    total: 6200000,
    status: "pending",
    itemsDescription: "Samsung Galaxy S21 256GB Phantom Gray",
    createdAt: randomDate(new Date(2024, 9, 13), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 13), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Wawan Setiawan",
    email: "wawan.s@gmail.com",
    total: 1850000,
    status: "delivered",
    itemsDescription: "Kindle Paperwhite 11th Gen 16GB",
    createdAt: randomDate(new Date(2024, 9, 4), new Date(2024, 9, 6)),
    updatedAt: randomDate(new Date(2024, 9, 9), new Date(2024, 9, 11)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Yuni Astuti",
    email: "yuni.a@yahoo.com",
    total: 5500000,
    status: "delivered",
    itemsDescription: "Lemari Pakaian 3 Pintu Jati",
    createdAt: randomDate(new Date(2024, 9, 2), new Date(2024, 9, 4)),
    updatedAt: randomDate(new Date(2024, 9, 8), new Date(2024, 9, 10)),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Zainal Abidin",
    email: "zainal.a@gmail.com",
    total: 850000,
    status: "shipped",
    itemsDescription: "Dumbbell Set 20kg (2x10kg)",
    createdAt: randomDate(new Date(2024, 9, 9), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 11), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Ayu Lestari",
    email: "ayu.lestari@outlook.com",
    total: 480000,
    status: "processing",
    itemsDescription: "Uniqlo Down Jacket Hitam Size L",
    createdAt: randomDate(new Date(2024, 9, 12), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 13), new Date()),
  },
  {
    orderNumber: generateOrderNumber(),
    customerName: "Bima Sakti",
    email: "bima.s@gmail.com",
    total: 3500000,
    status: "pending",
    itemsDescription: "Gundam PG Unicorn Gundam with LED",
    createdAt: randomDate(new Date(2024, 9, 13), new Date()),
    updatedAt: randomDate(new Date(2024, 9, 13), new Date()),
  },
];

// Main seed function
export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if data already exists
    const existingCategories = await db.categories.count();
    const existingProducts = await db.products.count();
    const existingSubmissions = await db.submissions.count();
    const existingOrders = await db.orders.count();

    if (
      existingCategories > 0 ||
      existingProducts > 0 ||
      existingSubmissions > 0 ||
      existingOrders > 0
    ) {
      console.log(
        "⚠️  Database already has data. Skipping seeding to prevent duplicates."
      );
      console.log(`📊 Current data count:`);
      console.log(`   - Categories: ${existingCategories}`);
      console.log(`   - Products: ${existingProducts}`);
      console.log(`   - Submissions: ${existingSubmissions}`);
      console.log(`   - Orders: ${existingOrders}`);
      return {
        success: true,
        message: "Database already seeded",
        counts: {
          categories: existingCategories,
          products: existingProducts,
          submissions: existingSubmissions,
          orders: existingOrders,
        },
      };
    }

    // Seed categories first
    console.log("📦 Seeding categories...");
    await db.categories.bulkAdd(categoriesData);
    const categoryCount = await db.categories.count();
    console.log(`✅ Added ${categoryCount} categories`);

    // Seed products
    console.log("📦 Seeding products...");
    await db.products.bulkAdd(productsData);
    const productCount = await db.products.count();
    console.log(`✅ Added ${productCount} products`);

    // Seed submissions
    console.log("📦 Seeding submissions...");
    await db.submissions.bulkAdd(submissionsData);
    const submissionCount = await db.submissions.count();
    console.log(`✅ Added ${submissionCount} submissions`);

    // Seed orders
    console.log("📦 Seeding orders...");
    await db.orders.bulkAdd(ordersData);
    const orderCount = await db.orders.count();
    console.log(`✅ Added ${orderCount} orders`);

    console.log("🎉 Database seeding completed successfully!");

    return {
      success: true,
      message: "Database seeded successfully",
      counts: {
        categories: categoryCount,
        products: productCount,
        submissions: submissionCount,
        orders: orderCount,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return {
      success: false,
      message: "Error seeding database",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Function to clear all data (useful for development/testing)
export const clearDatabase = async () => {
  try {
    console.log("🗑️  Clearing database...");

    await db.products.clear();
    await db.categories.clear();
    await db.submissions.clear();
    await db.orders.clear();

    console.log("✅ Database cleared successfully!");

    return {
      success: true,
      message: "Database cleared successfully",
    };
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    return {
      success: false,
      message: "Error clearing database",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Function to reset database (clear then seed)
export const resetDatabase = async () => {
  await clearDatabase();
  return await seedDatabase();
};
