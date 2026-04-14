-- Add missing columns to users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='telegramUserId') THEN
        ALTER TABLE users ADD COLUMN "telegramUserId" BIGINT NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='expirationDate') THEN
        ALTER TABLE users ADD COLUMN "expirationDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='inviterCode') THEN
        ALTER TABLE users ADD COLUMN "inviterCode" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='offerCode') THEN
        ALTER TABLE users ADD COLUMN "offerCode" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='isVerified') THEN
        ALTER TABLE users ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='isExpired') THEN
        ALTER TABLE users ADD COLUMN "isExpired" BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;
