-- Add columns to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "cashbackEnabled" BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "cashbackType" VARCHAR(20) DEFAULT 'percentage'; -- percentage, tiered, product_specific
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "cashbackPercentage" NUMERIC DEFAULT 0;

-- Add columns to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "cashbackBalance" NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "totalSpent" NUMERIC DEFAULT 0;

-- Add column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS "cashbackPercentage" NUMERIC DEFAULT 0;

-- Create cashback_tiers table
CREATE TABLE IF NOT EXISTS cashback_tiers (
    id SERIAL PRIMARY KEY,
    "businessId" INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    "minSpend" NUMERIC NOT NULL DEFAULT 0,
    percentage NUMERIC NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add columns to total_transactions
ALTER TABLE total_transactions ADD COLUMN IF NOT EXISTS "cashbackEarned" NUMERIC DEFAULT 0;
ALTER TABLE total_transactions ADD COLUMN IF NOT EXISTS "cashbackUsed" NUMERIC DEFAULT 0;

-- Add column to individual transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "cashbackAmount" NUMERIC DEFAULT 0;
