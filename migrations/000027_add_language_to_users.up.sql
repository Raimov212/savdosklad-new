-- Add language column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'uz';
