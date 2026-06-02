-- ============================================
-- FIX RLS POLICY FOR TRANSACTIONS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON transactions;

-- Create new policy to allow INSERT for authenticated users
CREATE POLICY "Allow insert for authenticated users" 
ON transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow SELECT for authenticated users
CREATE POLICY "Allow read for authenticated users" 
ON transactions 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow UPDATE for authenticated users
CREATE POLICY "Allow update for authenticated users" 
ON transactions 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create policy to allow DELETE for authenticated users
CREATE POLICY "Allow delete for authenticated users" 
ON transactions 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================
-- CREATE CATEGORIES TABLE
-- ============================================

-- Drop table if exists
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Allow read for authenticated users" 
ON categories 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON categories 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
ON categories 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow delete for authenticated users" 
ON categories 
FOR DELETE 
TO authenticated 
USING (true);

-- Insert initial categories
INSERT INTO categories (name) VALUES
  ('Susu UHT'),
  ('Susu Steril'),
  ('Yogurt'),
  ('Minuman'),
  ('Keju & Butter'),
  ('Produk Lainnya');

-- ============================================
-- UPDATE PRODUCTS TABLE TO USE CATEGORIES
-- ============================================

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_fkey'
  ) THEN
    -- First, update existing products to match category names
    UPDATE products 
    SET category = 'Produk Lainnya' 
    WHERE category NOT IN (
      SELECT name FROM categories
    );
    
    -- Add foreign key constraint
    ALTER TABLE products 
    ADD CONSTRAINT products_category_fkey 
    FOREIGN KEY (category) 
    REFERENCES categories(name) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- UPDATE SETTINGS TABLE FOR STORE NAME
-- ============================================

-- Check if settings table exists, if not create it
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT DEFAULT 'Toko Susu Alexa',
  store_subtitle TEXT DEFAULT 'POS & Manajemen Toko',
  store_address TEXT,
  store_phone TEXT,
  store_email TEXT,
  receipt_footer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;

-- Create RLS policies for settings
CREATE POLICY "Users can read own settings" 
ON settings 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON settings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON settings 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('transactions', 'categories', 'settings')
ORDER BY tablename, policyname;

-- Check categories
SELECT * FROM categories ORDER BY name;

-- Check settings table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;
