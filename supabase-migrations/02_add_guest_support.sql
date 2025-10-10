-- Migration to add guest user support to existing shared_cashflow_links table
-- Run this if you already created the table with the first migration

-- Add created_by_guest column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'shared_cashflow_links' 
        AND column_name = 'created_by_guest'
    ) THEN
        ALTER TABLE shared_cashflow_links 
        ADD COLUMN created_by_guest BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can create their own shareable links" ON shared_cashflow_links;

-- Recreate policy with new name
CREATE POLICY "Authenticated users can create their own shareable links"
  ON shared_cashflow_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add new policy for guest users
DROP POLICY IF EXISTS "Guest users can create shareable links" ON shared_cashflow_links;

CREATE POLICY "Guest users can create shareable links"
  ON shared_cashflow_links
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND created_by_guest = true);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'shared_cashflow_links'
ORDER BY ordinal_position;
