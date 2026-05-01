-- Create ENUM type for Asset Types
CREATE TYPE asset_type AS ENUM ('STOCK', 'MUTUAL_FUND', 'GOLD_ETF', 'CASH');

-- Create Holdings table
CREATE TABLE holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on holdings
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for holdings
CREATE POLICY "Users can view their own holdings" 
ON holdings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings" 
ON holdings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings" 
ON holdings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings" 
ON holdings FOR DELETE 
USING (auth.uid() = user_id);

-- Create PriceCache table
CREATE TABLE price_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_name TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  current_price NUMERIC NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_error_fallback BOOLEAN DEFAULT FALSE,
  UNIQUE(asset_name, asset_type)
);

-- Note: price_cache does not need RLS because it will be managed by a server-side cron job
-- using the service_role key, or we can just enable it and allow read access.
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read price cache (public read)
CREATE POLICY "Anyone can read price cache" 
ON price_cache FOR SELECT 
USING (true);

-- Allow service role to manage price cache
-- (Service role bypasses RLS automatically, but we can be explicit)
