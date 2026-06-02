# KasirKu - Aplikasi POS Toko Susu Modern

Aplikasi Point of Sale (POS) profesional untuk toko susu dan grocery skala menengah, dibangun dengan Next.js 14, React, dan Supabase.

## 🎯 Fitur Utama

### 1. **Dashboard**
- KPI cards real-time (penjualan hari ini, jumlah transaksi, total produk, stok rendah)
- Tabel transaksi terbaru
- Monitoring performa toko

### 2. **Point of Sale (POS)**
- Interface kasir yang intuitif
- Pencarian produk real-time
- Keranjang belanja dengan kalkulasi otomatis
- Dukungan multiple payment methods (Tunai, Kartu Kredit, QRIS, Transfer)
- Diskon dan pajak otomatis
- Integrasi pelanggan member

### 3. **Manajemen Barang**
- CRUD produk lengkap
- Barcode management
- Kategori produk
- Tracking stok real-time
- Alert stok rendah
- Harga beli dan jual

### 4. **Manajemen Pelanggan**
- Database pelanggan member
- Loyalty points system
- Riwayat transaksi pelanggan
- Segmentasi pelanggan

### 5. **Laporan & Analytics**
- Dashboard penjualan harian
- Tren penjualan (chart)
- Produk terlaris
- Breakdown metode pembayaran
- Export data

### 6. **Pengaturan Toko**
- Informasi toko
- Konfigurasi struk
- Preferensi tampilan
- Manajemen user

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### 1. Clone Repository
```bash
cd "c:\KASIR TOKO SUSU\app"
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Setup Environment Variables
Buat file `.env.local` di root project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Settings
NEXT_PUBLIC_APP_NAME=KasirKu
NEXT_PUBLIC_CURRENCY=IDR
NEXT_PUBLIC_TAX_RATE=0.1
```

### 4. Setup Supabase Database
Ikuti panduan di `SUPABASE_SETUP.md` untuk membuat tables dan konfigurasi RLS.

### 5. Run Development Server
```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📝 Demo Credentials

```
Email: admin@toko.com
Password: admin123
```

## 📁 Struktur Project

```
app/
├── app/
│   ├── (auth)/                    # Auth pages
│   │   └── login/page.js
│   ├── (dashboard)/               # Protected pages
│   │   ├── layout.js
│   │   ├── page.js               # Dashboard
│   │   ├── pos/page.js           # Point of Sale
│   │   ├── products/page.js      # Product Management
│   │   ├── customers/page.js     # Customer Management
│   │   ├── reports/page.js       # Reports & Analytics
│   │   └── settings/page.js      # Store Settings
│   ├── api/                       # API Routes
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.jsx
│   │       ├── Header.jsx
│   │       └── MainLayout.jsx
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── supabase.js               # Supabase client & API
│   ├── constants.js              # App constants
│   ├── validators.js             # Zod schemas
│   ├── utils.js                  # Helper functions
│   └── hooks.js                  # Custom React hooks
├── public/
├── .env.local
├── package.json
└── README.md
```

## 🔧 Teknologi yang Digunakan

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18 |
| **UI Framework** | Radix UI, Tailwind CSS |
| **State Management** | React Query, Zustand |
| **Form Handling** | React Hook Form, Zod |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts |
| **Notifications** | Sonner |
| **Icons** | Lucide React |

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product detail
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer detail
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get transaction detail

## 🎨 Customization

### Mengubah Warna Primary
Edit `app/globals.css`:
```css
:root {
  --primary: 160 84% 39%;  /* Ubah nilai HSL */
}
```

### Menambah Kategori Produk
Edit `lib/constants.js`:
```javascript
export const PRODUCT_CATEGORIES = [
  'Susu UHT',
  'Yogurt',
  'Minuman',
  'Keju & Butter',
  'Kategori Baru',  // Tambahkan di sini
]
```

### Mengubah Tax Rate
Edit `lib/constants.js`:
```javascript
export const TAX_RATE = 0.15  // 15% tax
```

## 🔐 Security

- Row Level Security (RLS) di Supabase
- Input validation dengan Zod
- Protected routes dengan middleware
- Secure password handling
- CORS configuration

## 📱 Responsive Design

Aplikasi fully responsive untuk:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan `.env.local` sudah diisi dengan benar
- Restart development server

### Error: "table does not exist"
- Jalankan SQL setup dari `SUPABASE_SETUP.md`
- Pastikan RLS policy sudah dikonfigurasi

### Produk tidak muncul di POS
- Cek apakah produk sudah ditambahkan di halaman Products
- Pastikan stok > 0

## 📞 Support

Untuk bantuan atau pertanyaan, hubungi tim development.

## 📄 License

Proprietary - Hak cipta dilindungi.

## 🎯 Roadmap

### Phase 1 (Selesai)
- ✅ Dashboard
- ✅ POS Interface
- ✅ Product Management
- ✅ Customer Management
- ✅ Reports & Analytics
- ✅ Settings

### Phase 2 (Upcoming)
- [ ] Authentication & Authorization
- [ ] Barcode Scanner Integration
- [ ] Receipt Printing
- [ ] Inventory Management
- [ ] Multi-store Support
- [ ] Mobile App

### Phase 3 (Future)
- [ ] Payment Gateway Integration
- [ ] Email Notifications
- [ ] WhatsApp Integration
- [ ] Advanced Analytics
- [ ] AI Recommendations

---

**Dibuat dengan ❤️ untuk toko susu Indonesia**
