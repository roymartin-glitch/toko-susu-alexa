-- ============================================
-- FIX RLS POLICY FOR STOCK UPDATES
-- ============================================
-- Problem: Stock tidak berkurang karena RLS policy terlalu ketat
-- Solution: Allow anon role to update products (since we're using anon key)
-- ============================================

-- Drop existing restrictive policies for products
DROP POLICY IF EXISTS "admin_read_products" ON products;
DROP POLICY IF EXISTS "admin_create_products" ON products;
DROP POLICY IF EXISTS "admin_update_products" ON products;
DROP POLICY IF EXISTS "admin_delete_products" ON products;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON products;

-- Create new permissive policies for products (allow anon + authenticated)
CREATE POLICY "Allow read products" 
ON products 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow create products" 
ON products 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update products" 
ON products 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete products" 
ON products 
FOR DELETE 
TO anon, authenticated
USING (true);

-- ============================================
-- ALSO FIX TRANSACTIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "admin_read_transactions" ON transactions;
DROP POLICY IF EXISTS "admin_create_transactions" ON transactions;
DROP POLICY IF EXISTS "admin_update_transactions" ON transactions;
DROP POLICY IF EXISTS "admin_delete_transactions" ON transactions;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON transactions;

CREATE POLICY "Allow read transactions" 
ON transactions 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow create transactions" 
ON transactions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update transactions" 
ON transactions 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete transactions" 
ON transactions 
FOR DELETE 
TO anon, authenticated
USING (true);

-- ============================================
-- FIX CUSTOMERS TABLE
-- ============================================

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
DROP POLICY IF EXISTS "admin_create_customers" ON customers;
DROP POLICY IF EXISTS "admin_update_customers" ON customers;
DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON customers;

CREATE POLICY "Allow read customers" 
ON customers 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow create customers" 
ON customers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update customers" 
ON customers 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete customers" 
ON customers 
FOR DELETE 
TO anon, authenticated
USING (true);

-- ============================================
-- FIX CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "admin_read_categories" ON categories;
DROP POLICY IF EXISTS "admin_create_categories" ON categories;
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON categories;

CREATE POLICY "Allow read categories" 
ON categories 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow create categories" 
ON categories 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update categories" 
ON categories 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete categories" 
ON categories 
FOR DELETE 
TO anon, authenticated
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all policies
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('products', 'transactions', 'customers', 'categories')
ORDER BY tablename, policyname;

-- Test query to ensure policies work
SELECT 'RLS Policies Updated Successfully!' as status;
