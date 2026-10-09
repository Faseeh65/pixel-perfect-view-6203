-- ============================================================================
-- PRINTZY SUPABASE / POSTGRESQL PRODUCTION MIGRATION
-- File: supabase/migrations/00001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

CREATE TYPE quote_status AS ENUM ('pending', 'in_review', 'quoted', 'fulfilled', 'cancelled');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'customer');

-- ============================================================================
-- 2. TABLES & CONSTRAINTS
-- ============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  phone VARCHAR(30) CHECK (phone IS NULL OR phone ~ '^[\d\s\+\-\(\)]{7,30}$'),
  company_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Users Lookup (Fast authorization checks)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Packaging Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9\-]+$'),
  title VARCHAR(200) NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT NOT NULL,
  min_quantity INT NOT NULL DEFAULT 100 CHECK (min_quantity > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Quote Requests
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL CHECK (char_length(trim(customer_name)) > 0),
  business_name VARCHAR(100),
  phone VARCHAR(30) NOT NULL CHECK (phone ~ '^[\d\s\+\-\(\)]{7,30}$'),
  email VARCHAR(255) CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_slug VARCHAR(100) NOT NULL,
  quantity VARCHAR(50) NOT NULL DEFAULT '1000',
  details TEXT CHECK (char_length(details) <= 2000),
  status quote_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_product_id ON public.quote_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Filter & Sorting indexes for dashboard queries & pagination
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON public.quote_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at_desc ON public.quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin Users Policies
CREATE POLICY "Only admins can view admin table"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());

-- Products Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Only admins can modify products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Quote Requests Policies
CREATE POLICY "Anyone (guest or user) can submit a quote"
  ON public.quote_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view their own quotes"
  ON public.quote_requests FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin()
  );

CREATE POLICY "Only admins can update or delete quotes"
  ON public.quote_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
