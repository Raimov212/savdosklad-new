-- Add createdBy column to users table to link Employees to their Admin
ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);
