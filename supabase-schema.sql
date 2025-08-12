-- Cashflow Management Database Schema
-- Run this in your Supabase SQL Editor

-- Create user_cashflow_data table
CREATE TABLE user_cashflow_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for fast lookups by user_email
CREATE INDEX idx_user_cashflow_data_user_email ON user_cashflow_data(user_email);
CREATE INDEX idx_user_cashflow_data_user_id ON user_cashflow_data(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_cashflow_data_updated_at 
    BEFORE UPDATE ON user_cashflow_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Users can only see their own data
ALTER TABLE user_cashflow_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cashflow data
CREATE POLICY "Users can view their own cashflow data" ON user_cashflow_data
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = user_email
    );

-- Policy: Users can insert their own cashflow data  
CREATE POLICY "Users can insert their own cashflow data" ON user_cashflow_data
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = user_email
    );

-- Policy: Users can update their own cashflow data
CREATE POLICY "Users can update their own cashflow data" ON user_cashflow_data
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = user_email
    );

-- Policy: Users can delete their own cashflow data
CREATE POLICY "Users can delete their own cashflow data" ON user_cashflow_data
    FOR DELETE USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = user_email
    );

-- Create a view for easier querying (optional)
CREATE VIEW user_cashflow_summary AS
SELECT 
    user_email,
    user_id,
    data->>'version' as data_version,
    (data->>'startingBalance')::numeric as starting_balance,
    jsonb_array_length(data->'incomes') as income_count,
    jsonb_array_length(data->'recurringExpenses') as recurring_expense_count,
    jsonb_array_length(data->'oneTimeExpenses') as one_time_expense_count,
    jsonb_array_length(data->'creditCards') as credit_card_count,
    updated_at
FROM user_cashflow_data;