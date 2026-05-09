-- Supabase Schema Update: Barbers
-- Execute this in the Supabase SQL Editor

CREATE TABLE barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tickets ADD COLUMN barber_id uuid REFERENCES barbers(id) ON DELETE SET NULL;

-- RLS (Row Level Security)
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Anyone can read barbers
CREATE POLICY "Public barbers are viewable by everyone." 
  ON barbers FOR SELECT USING (true);

-- Only shop owners can insert/update/delete barbers
CREATE POLICY "Shop owners can manage barbers."
  ON barbers FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = barbers.shop_id AND shops.owner_id = auth.uid())
  );
