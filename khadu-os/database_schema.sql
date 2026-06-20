-- KhaduOS Enterprise Database Schema
-- Version 7.0 (The Enterprise-Grade D2C Engine)
-- Execute this script in your Supabase SQL Editor

-- 1. STORES (Config)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    payment_keys JSONB DEFAULT '{}'::jsonb,
    meta_ads_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS (Cached in Redis for read-heavy operations)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('digital', 'physical')),
    price_original NUMERIC(10, 2) NOT NULL,
    price_discounted NUMERIC(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    is_perishable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for fast product lookups on storefront
CREATE INDEX idx_products_active ON products(is_active);

-- 3. CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    name TEXT,
    crm_stage VARCHAR(30) DEFAULT 'lead',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_customer UNIQUE (email, phone)
);
-- Index for fast CRM searches & Identity resolution
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- 4. ORDERS (Transactional Integrity)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    prepaid_amount NUMERIC(10, 2) NOT NULL, -- The 30%+ deposit
    cod_collectible_amount NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB,
    utm_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for admin dashboard speed
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 5. ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- 6. TRANSACTIONS / AUDIT LEDGER (Crucial for Enterprise Accounting)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    gateway_transaction_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'success',
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 8. BASIC POLICIES (Read-only for public catalog, full access for authenticated service role)
CREATE POLICY "Public profiles are viewable by everyone." ON products FOR SELECT USING (true);
-- Note: Further granular RLS policies should be configured based on authentication tokens.
