-- Add Telegram-related columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "telegramUserId" BIGINT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'uz';

-- Create index for faster lookup by telegramUserId
CREATE INDEX IF NOT EXISTS idx_clients_telegram_user_id ON clients ("telegramUserId");
