-- Create shared_cashflow_links table for read-only link sharing
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS shared_cashflow_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Nullable for guest users
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_by_guest BOOLEAN DEFAULT FALSE,  -- Track if created by guest
  
  -- Indexes for performance
  CONSTRAINT unique_share_token UNIQUE (share_token)
);

-- Create index on share_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_cashflow_links(share_token);

-- Create index on user_id for user's link management
CREATE INDEX IF NOT EXISTS idx_shared_links_user ON shared_cashflow_links(user_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_shared_links_expires ON shared_cashflow_links(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shared_cashflow_links ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create their own shareable links
CREATE POLICY "Authenticated users can create their own shareable links"
  ON shared_cashflow_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Guest users (anonymous) can create shareable links
CREATE POLICY "Guest users can create shareable links"
  ON shared_cashflow_links
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND created_by_guest = true);

-- Policy: Users can view their own shareable links
CREATE POLICY "Users can view their own shareable links"
  ON shared_cashflow_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own shareable links
CREATE POLICY "Users can delete their own shareable links"
  ON shared_cashflow_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anyone (including anonymous) can view shared data by token
-- This allows the public read-only view to work
CREATE POLICY "Anyone can view shared links by token"
  ON shared_cashflow_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Anyone can update view count (for tracking)
CREATE POLICY "Anyone can update view count"
  ON shared_cashflow_links
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically delete expired links (optional)
CREATE OR REPLACE FUNCTION delete_expired_shared_links()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_cashflow_links
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled:
-- SELECT cron.schedule('delete-expired-shared-links', '0 2 * * *', 'SELECT delete_expired_shared_links()');
