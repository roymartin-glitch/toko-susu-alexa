-- ============================================
-- INSERT DATA PRODUK, PELANGGAN, DAN TRANSAKSI
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. INSERT PRODUK (20 produk susu)
INSERT INTO products (barcode, name, category, buy_price, sell_price, stock, unit) VALUES
('8992753600016', 'Ultra Milk Full Cream 250ml', 'Susu UHT', 6000, 7500, 50, 'pcs'),
('8992753600023', 'Ultra Milk Coklat 250ml', 'Susu UHT', 6000, 7500, 45, 'pcs'),
('8992753600030', 'Ultra Milk Stroberi 250ml', 'Susu UHT', 6000, 7500, 40, 'pcs'),
('8992745100014', 'Indomilk Putih 190ml', 'Susu UHT', 4500, 5500, 60, 'pcs'),
('8992745100021', 'Indomilk Coklat 190ml', 'Susu UHT', 4500, 5500, 55, 'pcs'),
('8992745100038', 'Indomilk Stroberi 190ml', 'Susu UHT', 4500, 5500, 50, 'pcs'),
('8992696100015', 'Milo UHT 180ml', 'Minuman', 5000, 6500, 48, 'pcs'),
('8992696100022', 'Milo Activ-Go 180ml', 'Minuman', 5500, 7000, 42, 'pcs'),
('8992696200016', 'Bear Brand 189ml', 'Susu Steril', 9500, 11500, 35, 'pcs'),
('8992696200023', 'Bear Brand Gold 189ml', 'Susu Steril', 10500, 12500, 30, 'pcs'),
('8992753700017', 'Greenfields Full Cream 250ml', 'Susu UHT', 10000, 12500, 38, 'pcs'),
('8992753700024', 'Greenfields Low Fat 250ml', 'Susu UHT', 10500, 13000, 32, 'pcs'),
('8992745200015', 'Frisian Flag Purefarm 225ml', 'Susu UHT', 5500, 7000, 52, 'pcs'),
('8992745200022', 'Frisian Flag Coklat 225ml', 'Susu UHT', 5500, 7000, 48, 'pcs'),
('8992696300017', 'Dancow Fortigro Instant 800g', 'Susu Bubuk', 65000, 78000, 15, 'box'),
('8992696300024', 'Dancow Fortigro Coklat 800g', 'Susu Bubuk', 68000, 82000, 12, 'box'),
('8992753800018', 'Yogurt Cimory Plain 120ml', 'Yogurt', 6000, 8000, 28, 'pcs'),
('8992753800025', 'Yogurt Cimory Stroberi 120ml', 'Yogurt', 6000, 8000, 25, 'pcs'),
('8992753800032', 'Yogurt Cimory Blueberry 120ml', 'Yogurt', 6500, 8500, 22, 'pcs'),
('8992745300016', 'Keju Kraft Cheddar 165g', 'Keju & Butter', 28000, 35000, 18, 'pcs');

-- 2. INSERT PELANGGAN (8 pelanggan)
INSERT INTO customers (name, phone, email, address, points, total_tx, total_spent) VALUES
('Budi Santoso', '081234567890', 'budi.santoso@email.com', 'Jl. Merdeka No. 123, Jakarta Pusat', 150, 12, 450000),
('Siti Nurhaliza', '081234567891', 'siti.nur@email.com', 'Jl. Sudirman No. 45, Jakarta Selatan', 280, 25, 850000),
('Ahmad Wijaya', '081234567892', 'ahmad.w@email.com', 'Jl. Gatot Subroto No. 78, Jakarta Barat', 95, 8, 320000),
('Dewi Lestari', '081234567893', 'dewi.lestari@email.com', 'Jl. Thamrin No. 56, Jakarta Pusat', 420, 35, 1250000),
('Rudi Hartono', '081234567894', 'rudi.h@email.com', 'Jl. Kuningan No. 89, Jakarta Selatan', 180, 15, 580000),
('Linda Kusuma', '081234567895', 'linda.k@email.com', 'Jl. Rasuna Said No. 34, Jakarta Selatan', 310, 28, 950000),
('Eko Prasetyo', '081234567896', 'eko.p@email.com', 'Jl. HR Rasuna Said No. 12, Jakarta Timur', 65, 5, 210000),
('Maya Sari', '081234567897', 'maya.sari@email.com', 'Jl. Senopati No. 67, Jakarta Selatan', 520, 42, 1680000);

-- 3. INSERT TRANSAKSI CONTOH (5 transaksi)
-- Ambil ID produk dan customer yang baru saja diinsert
DO $$
DECLARE
  customer1_id text;
  customer2_id text;
  product1_id text;
  product2_id text;
  product3_id text;
  product4_id text;
  product5_id text;
BEGIN
  -- Get customer IDs
  SELECT id INTO customer1_id FROM customers WHERE phone = '081234567890' LIMIT 1;
  SELECT id INTO customer2_id FROM customers WHERE phone = '081234567891' LIMIT 1;
  
  -- Get product IDs
  SELECT id INTO product1_id FROM products WHERE barcode = '8992753600016' LIMIT 1;
  SELECT id INTO product2_id FROM products WHERE barcode = '8992745100014' LIMIT 1;
  SELECT id INTO product3_id FROM products WHERE barcode = '8992696100015' LIMIT 1;
  SELECT id INTO product4_id FROM products WHERE barcode = '8992696200016' LIMIT 1;
  SELECT id INTO product5_id FROM products WHERE barcode = '8992753600023' LIMIT 1;
  
  -- Transaction 1
  INSERT INTO transactions (no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change)
  VALUES (
    'TRX-' || EXTRACT(EPOCH FROM NOW())::bigint || '-001',
    customer1_id,
    'Budi Santoso',
    jsonb_build_array(
      jsonb_build_object('product_id', product1_id, 'barcode', '8992753600016', 'name', 'Ultra Milk Full Cream 250ml', 'quantity', 2, 'price', 7500, 'subtotal', 15000),
      jsonb_build_object('product_id', product2_id, 'barcode', '8992745100014', 'name', 'Indomilk Putih 190ml', 'quantity', 3, 'price', 5500, 'subtotal', 16500)
    ),
    5,
    31500,
    0,
    3150,
    34650,
    'tunai',
    50000,
    15350
  );
  
  -- Transaction 2
  INSERT INTO transactions (no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change)
  VALUES (
    'TRX-' || EXTRACT(EPOCH FROM NOW())::bigint || '-002',
    customer2_id,
    'Siti Nurhaliza',
    jsonb_build_array(
      jsonb_build_object('product_id', product3_id, 'barcode', '8992696100015', 'name', 'Milo UHT 180ml', 'quantity', 4, 'price', 6500, 'subtotal', 26000)
    ),
    4,
    26000,
    2000,
    2400,
    26400,
    'qris',
    26400,
    0
  );
  
  -- Transaction 3
  INSERT INTO transactions (no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change)
  VALUES (
    'TRX-' || EXTRACT(EPOCH FROM NOW())::bigint || '-003',
    NULL,
    'Umum (Tanpa Member)',
    jsonb_build_array(
      jsonb_build_object('product_id', product4_id, 'barcode', '8992696200016', 'name', 'Bear Brand 189ml', 'quantity', 1, 'price', 11500, 'subtotal', 11500),
      jsonb_build_object('product_id', product5_id, 'barcode', '8992753600023', 'name', 'Ultra Milk Coklat 250ml', 'quantity', 2, 'price', 7500, 'subtotal', 15000)
    ),
    3,
    26500,
    0,
    2650,
    29150,
    'tunai',
    30000,
    850
  );
  
  -- Transaction 4
  INSERT INTO transactions (no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change)
  VALUES (
    'TRX-' || EXTRACT(EPOCH FROM NOW())::bigint || '-004',
    customer1_id,
    'Budi Santoso',
    jsonb_build_array(
      jsonb_build_object('product_id', product1_id, 'barcode', '8992753600016', 'name', 'Ultra Milk Full Cream 250ml', 'quantity', 5, 'price', 7500, 'subtotal', 37500)
    ),
    5,
    37500,
    1500,
    3600,
    39600,
    'kartu_kredit',
    39600,
    0
  );
  
  -- Transaction 5
  INSERT INTO transactions (no, customer_id, customer_name, items, item_count, subtotal, discount, tax, total, payment_method, paid, change)
  VALUES (
    'TRX-' || EXTRACT(EPOCH FROM NOW())::bigint || '-005',
    NULL,
    'Umum (Tanpa Member)',
    jsonb_build_array(
      jsonb_build_object('product_id', product2_id, 'barcode', '8992745100014', 'name', 'Indomilk Putih 190ml', 'quantity', 6, 'price', 5500, 'subtotal', 33000),
      jsonb_build_object('product_id', product3_id, 'barcode', '8992696100015', 'name', 'Milo UHT 180ml', 'quantity', 3, 'price', 6500, 'subtotal', 19500)
    ),
    9,
    52500,
    0,
    5250,
    57750,
    'transfer',
    57750,
    0
  );
  
END $$;

-- Verifikasi data
SELECT 'Products' as table_name, COUNT(*) as total FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;

-- Tampilkan sample data
SELECT 'Sample Products:' as info;
SELECT name, barcode, sell_price, stock FROM products LIMIT 5;

SELECT 'Sample Customers:' as info;
SELECT name, phone, points FROM customers LIMIT 5;

SELECT 'Sample Transactions:' as info;
SELECT no, customer_name, total, payment_method, created_at FROM transactions LIMIT 5;
