-- Migration for daily portfolio snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  total_value NUMERIC NOT NULL,
  total_invested NUMERIC NOT NULL,
  day_change NUMERIC DEFAULT 0,
  day_change_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own snapshots" 
ON portfolio_snapshots FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots" 
ON portfolio_snapshots FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snapshots" 
ON portfolio_snapshots FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots" 
ON portfolio_snapshots FOR DELETE 
USING (auth.uid() = user_id);
