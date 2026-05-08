-- categories
CREATE TABLE categories (
  id         TEXT PRIMARY KEY,       -- e.g. 'pizza', 'pasta'
  sort_order INT NOT NULL DEFAULT 0,
  emoji      TEXT DEFAULT '🍕',
  is_visible BOOLEAN DEFAULT true
);

-- menu_items
CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  category_id  TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  prices       JSONB NOT NULL,        -- see §3.2
  image_url    TEXT,
  allergens    TEXT[] DEFAULT '{}',
  tags         TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;

-- Public can read all rows (anon key)
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "public_read_menu_items"
  ON menu_items FOR SELECT USING (true);

-- Only authenticated users (admins) can write
CREATE POLICY "admin_all_categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_menu_items"
  ON menu_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
