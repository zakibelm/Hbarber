-- Supabase Schema for H Barber
-- Execute this in the Supabase SQL Editor

CREATE TABLE shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  address text,
  avg_service_min integer DEFAULT 15,
  is_open boolean DEFAULT true,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TYPE ticket_status AS ENUM ('waiting', 'called', 'served', 'skipped');

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  num integer NOT NULL,
  name text NOT NULL,
  phone text,
  service text,
  status ticket_status DEFAULT 'waiting' NOT NULL,
  arrived_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  called_at timestamp with time zone,
  served_at timestamp with time zone,
  dur_min integer,
  
  -- Prevent same number in same shop on same day
  CONSTRAINT tickets_shop_num_date_key UNIQUE (shop_id, num, arrived_at::date)
);

-- RLS (Row Level Security)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for shops
-- Anyone can read shops
CREATE POLICY "Public shops are viewable by everyone." 
  ON shops FOR SELECT USING (true);

-- Only owner can insert/update their shop
CREATE POLICY "Users can create their own shop."
  ON shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own shop."
  ON shops FOR UPDATE USING (auth.uid() = owner_id);

-- Policies for tickets
-- Anyone can read tickets
CREATE POLICY "Public tickets are viewable by everyone." 
  ON tickets FOR SELECT USING (true);

-- Anyone can insert a ticket (joining the queue)
CREATE POLICY "Anyone can join the queue."
  ON tickets FOR INSERT WITH CHECK (true);

-- Only shop owner can update tickets
CREATE POLICY "Shop owners can update tickets."
  ON tickets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = tickets.shop_id AND shops.owner_id = auth.uid())
  );

-- Trigger for auto-incrementing ticket numbers per shop per day
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger AS $$
BEGIN
  SELECT COALESCE(MAX(num), 0) + 1 INTO NEW.num
  FROM tickets
  WHERE shop_id = NEW.shop_id AND arrived_at::date = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION set_ticket_number();
