-- ================================================
-- CITgive — Migration Boutique
-- Tables shop_products + shop_orders + bucket Storage
-- À coller dans l'éditeur SQL Supabase
-- ================================================

-- 1. Table des produits de la boutique
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des commandes boutique
CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE RESTRICT,
  email VARCHAR(255) NOT NULL,
  roblox_username VARCHAR(255) NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_shop_orders_product ON shop_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_stripe ON shop_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status, created_at DESC);

-- ================================================
-- RLS
-- ================================================

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- Lecture publique des produits actifs (vitrine boutique)
CREATE POLICY "Public can read active shop products"
  ON shop_products FOR SELECT
  USING (is_active = true);

-- Les commandes sont gérées uniquement côté serveur (service role bypass RLS)
-- Aucune policy SELECT publique sur shop_orders

-- ================================================
-- Storage bucket pour les images produits
-- (Lecture publique, upload uniquement via service role)
-- ================================================

-- Crée le bucket public 'shop-images' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Lecture publique des images
DROP POLICY IF EXISTS "Public can read shop-images" ON storage.objects;
CREATE POLICY "Public can read shop-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-images');
