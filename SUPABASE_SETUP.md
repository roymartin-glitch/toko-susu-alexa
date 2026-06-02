# Supabase Setup untuk KasirKu POS

## 1. Setup Supabase Account & Project
1. Buka [supabase.com](https://supabase.com) dan login/register
2. Buat project baru atau gunakan project existing
3. Tunggu project selesai di-provision

## 2. Ambil Credentials
Di halaman project Supabase:
- Klik "Settings" → "API"
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Update .env.local
File: `/app/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Buat Tables di Supabase

### Table: products
```sql
create table public.products (
  id text primary key default gen_random_uuid()::text,
  barcode text not null unique,
  name text not null,
  category text not null,
  buy_price integer default 0,
  sell_price integer not null,
  stock integer default 0,
  unit text default 'pcs',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table products enable row level security;

-- Allow anonymous select
create policy "Allow anonymous select"
  on products for select
  using (true);

-- Allow authenticated insert/update/delete
create policy "Allow authenticated CRUD"
  on products for all
  using (auth.role() = 'authenticated');
```

### Table: customers
```sql
create table public.customers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text not null,
  email text,
  address text,
  total_tx integer default 0,
  total_spent integer default 0,
  points integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table customers enable row level security;

-- Allow anonymous select
create policy "Allow anonymous select"
  on customers for select
  using (true);

-- Allow authenticated insert/update/delete
create policy "Allow authenticated CRUD"
  on customers for all
  using (auth.role() = 'authenticated');
```

### Table: transactions
```sql
create table public.transactions (
  id text primary key default gen_random_uuid()::text,
  no text not null unique,
  customer_id text references customers(id),
  customer_name text,
  items jsonb not null,
  item_count integer default 0,
  subtotal integer,
  discount integer default 0,
  tax integer default 0,
  total integer not null,
  payment_method text,
  paid integer,
  change integer default 0,
  created_at timestamp default now()
);

-- Enable RLS
alter table transactions enable row level security;

-- Allow anonymous select
create policy "Allow anonymous select"
  on transactions for select
  using (true);

-- Allow authenticated insert/update/delete
create policy "Allow authenticated CRUD"
  on transactions for all
  using (auth.role() = 'authenticated');
```

### Table: settings
```sql
create table public.settings (
  id text primary key default gen_random_uuid()::text,
  user_id text,
  store_name text,
  address text,
  phone text,
  footer text,
  paper_size text default '80mm',
  show_logo boolean default true,
  dark_mode boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table settings enable row level security;

-- Allow authenticated access
create policy "Allow authenticated CRUD"
  on settings for all
  using (auth.role() = 'authenticated');
```

## 5. Install Supabase Client
```bash
cd app
npm install @supabase/supabase-js
```

## 6. Test Koneksi
Jalankan aplikasi:
```bash
npm run dev
```

Aplikasi akan terhubung ke Supabase otomatis. Jika masih tidak ada data, import data dummy ke database terlebih dahulu.

## 7. Import Data Dummy (Optional)
Di Supabase Studio, gunakan SQL Editor untuk insert data dummy dari `posData.js`

## Database Schema Overview
```
products (id, barcode, name, category, buy_price, sell_price, stock, unit, created_at, updated_at)
customers (id, name, phone, email, address, total_tx, total_spent, points, created_at, updated_at)
transactions (id, no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change, created_at)
settings (id, user_id, store_name, address, phone, footer, paper_size, show_logo, dark_mode, created_at, updated_at)
```

## Troubleshooting
- **"Missing Supabase environment variables"** → Pastikan .env.local sudah diisi dengan benar
- **"table does not exist"** → Buat table di Supabase sesuai SQL di atas
- **CORS Error** → Di Supabase project settings, tambahkan localhost ke CORS whitelist
