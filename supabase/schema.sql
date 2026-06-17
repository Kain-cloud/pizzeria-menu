-- ============================================
-- Pizzeria Ardi — Database Schema
-- ============================================

-- Categories
CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  emoji      TEXT DEFAULT '🍕',
  is_visible BOOLEAN DEFAULT true
);

-- Menu Items
CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  category_id  TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  prices       JSONB NOT NULL,
  image_url    TEXT,
  allergens    TEXT[] DEFAULT '{}',
  tags         TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INT NOT NULL DEFAULT 0,
  translations JSONB DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics: dish views
CREATE TABLE menu_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_views_item ON menu_views(item_id);
CREATE INDEX idx_menu_views_time ON menu_views(viewed_at);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_views  ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT USING (true);

-- Admin write access (authenticated users)
CREATE POLICY "admin_all_categories" ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_menu_items" ON menu_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Analytics: anyone can insert, only admins can read
CREATE POLICY "public_insert_views" ON menu_views FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_views"    ON menu_views FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- Supabase Storage (run in Supabase Dashboard)
-- ============================================
-- 1. Create bucket: menu-images (public)
-- 2. Add policies:
--    - INSERT: authenticated users
--    - SELECT: public (everyone)
--    - DELETE: authenticated users

-- Enable realtime for live menu updates
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
