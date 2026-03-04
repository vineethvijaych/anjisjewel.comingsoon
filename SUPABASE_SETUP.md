# AnjisJewel — Complete Supabase Setup Guide
# ============================================
# Run these SQL blocks IN ORDER in:
# Supabase Dashboard → SQL Editor → New Query

# ════════════════════════════════════════════
# STEP 1 — CREATE TABLES
# ════════════════════════════════════════════

-- ── Products ──
CREATE TABLE IF NOT EXISTS products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  image       TEXT,
  stock       INTEGER     NOT NULL DEFAULT 0,
  category    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cart ──
-- NOTE: UNIQUE constraint prevents duplicate rows (fixes double-insert bug)
CREATE TABLE IF NOT EXISTS cart (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cart_user_product_unique UNIQUE (user_id, product_id)
);

-- ── Orders ──
-- IMPORTANT: items column is TEXT (we store JSON string from JS)
-- Postgres will handle it fine; we read it back as JSON in the app
CREATE TABLE IF NOT EXISTS orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        TEXT        NOT NULL UNIQUE,
  items           TEXT        NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst             NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT        NOT NULL DEFAULT 'card',
  status          TEXT        NOT NULL DEFAULT 'paid',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


# ════════════════════════════════════════════
# STEP 2 — ROW LEVEL SECURITY (RLS)
# ════════════════════════════════════════════

-- ── Products RLS ──
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out users) can view products
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Authenticated users can update stock (needed for checkout)
CREATE POLICY "Auth users can update product stock"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ── Cart RLS ──
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart"
  ON cart FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Orders RLS ──
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);


# ════════════════════════════════════════════
# STEP 3 — SEED SAMPLE PRODUCTS
# (Run this only once)
# ════════════════════════════════════════════

INSERT INTO products (name, description, price, image, stock, category) VALUES
(
  'Royal Emerald Ring',
  'A stunning 2.4ct Colombian emerald set in 18K gold with pavé diamond shoulders.',
  125000,
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  8, 'rings'
),
(
  'Diamond Tennis Bracelet',
  'Forty brilliant-cut diamonds totalling 5ct, set in polished platinum.',
  285000,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  4, 'bracelets'
),
(
  'Pearl Drop Earrings',
  'South Sea baroque pearls (12mm) suspended from diamond-set 18K white gold hooks.',
  68000,
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
  12, 'earrings'
),
(
  'Sapphire Pendant',
  'Ceylon cornflower blue sapphire (3.1ct) in a halo of round brilliants.',
  195000,
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80',
  6, 'pendants'
),
(
  'Gold Chain Necklace',
  'Hand-woven 22K yellow gold Venetian chain, 18 inches, 3.5mm wide.',
  42000,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  15, 'necklaces'
),
(
  'Ruby Eternity Band',
  'Eighteen Burmese rubies alternating with brilliant diamonds in a platinum band.',
  158000,
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
  5, 'rings'
);


# ════════════════════════════════════════════
# STEP 4 — VERIFY EVERYTHING WORKS
# (Run this after setup — should return rows)
# ════════════════════════════════════════════

SELECT id, name, price, stock FROM products ORDER BY created_at;


# ════════════════════════════════════════════
# STEP 5 — AUTH SETTINGS (do in Dashboard UI)
# ════════════════════════════════════════════
#
# Go to: Authentication → Providers → Email
#   ✅ Enable Email provider
#   ✅ Enable "Confirm email" (optional for dev, recommended for prod)
#
# Go to: Authentication → URL Configuration
#   Site URL:      https://yourdomain.com
#   Redirect URLs: http://localhost:5173/**
#                  https://yourdomain.com/**


# ════════════════════════════════════════════
# STEP 6 — LOCAL DEV STARTUP
# ════════════════════════════════════════════
#
# cd into the project folder, then:
#   npm install
#   npm run dev
#
# App runs at: http://localhost:5173


# ════════════════════════════════════════════
# ADMIN: VIEW ALL ORDERS (run anytime in SQL Editor)
# ════════════════════════════════════════════

SELECT
  o.order_id,
  o.status,
  o.total,
  o.payment_method,
  o.created_at,
  u.email
FROM orders o
JOIN auth.users u ON o.user_id = u.id
ORDER BY o.created_at DESC;


# ════════════════════════════════════════════
# TROUBLESHOOTING: Common errors & fixes
# ════════════════════════════════════════════
#
# ERROR 406 on cart query
#   → RLS is blocking. Make sure you ran the cart RLS policy above.
#     Also check the user is logged in before querying cart.
#
# ERROR 400 on orders insert
#   → The orders table doesn't exist yet, OR items column type mismatch.
#     Drop and recreate: DROP TABLE IF EXISTS orders; then re-run Step 1C.
#
# ERROR 42501 (permission denied) on stock update
#   → You're missing the products UPDATE policy. Re-run Step 2 for products.
#
# Cart shows 406 even when logged in
#   → Check that cart table has UNIQUE constraint on (user_id, product_id).
#     Run: SELECT * FROM information_schema.table_constraints WHERE table_name='cart';
#
# Images not loading (ERR_NAME_NOT_RESOLVED)
#   → The image URLs in your products table are broken/empty.
#     Run the seed INSERT in Step 3 to add working Unsplash image URLs.
