-- ============================================
-- IMPROVED RLS POLICIES - SECURITY ENHANCEMENT
-- ============================================

-- NOTE: These policies should be applied to all tables for better security
-- Run these in Supabase SQL editor after updating user management

-- ============================================
-- 1. ADD USER/ADMIN TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. UPDATE RLS POLICIES - PRODUCTS TABLE
-- ============================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow read for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON products;

-- Create new admin-only policies
CREATE POLICY "admin_read_products" 
ON products 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_create_products" 
ON products 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_update_products" 
ON products 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_delete_products" 
ON products 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- ============================================
-- 3. UPDATE RLS POLICIES - CUSTOMERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow read for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON customers;

CREATE POLICY "admin_read_customers" 
ON customers 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_create_customers" 
ON customers 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_update_customers" 
ON customers 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_delete_customers" 
ON customers 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- ============================================
-- 4. UPDATE RLS POLICIES - TRANSACTIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON transactions;

CREATE POLICY "admin_read_transactions" 
ON transactions 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_create_transactions" 
ON transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_update_transactions" 
ON transactions 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_delete_transactions" 
ON transactions 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- ============================================
-- 5. UPDATE RLS POLICIES - CATEGORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow read for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON categories;

CREATE POLICY "admin_read_categories" 
ON categories 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_create_categories" 
ON categories 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_update_categories" 
ON categories 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "admin_delete_categories" 
ON categories 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- ============================================
-- 6. INSERT ADMIN USER
-- ============================================

INSERT INTO admin_users (email, name, role) 
VALUES ('admin@toko.com', 'Admin Toko', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 
-- Current Implementation Notes:
-- 1. RLS policies still allow authenticated users only
-- 2. In production with Supabase Auth, connect auth.users to admin_users
-- 3. These policies prevent cross-tenant data leakage
-- 4. Current custom JWT implementation bypasses Supabase Auth
--    Consider migrating to Supabase Auth for built-in RLS integration
--
-- Migration Path:
-- 1. Implement Supabase Auth in application
-- 2. Replace JWT with Supabase sessions
-- 3. Use auth.uid() in RLS policies for per-user data scoping
-- 4. Update middleware to check Supabase session
--
