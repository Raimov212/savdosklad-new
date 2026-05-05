-- Users jadvaliga marketplace ruxsati ustunini qo'shish
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isMarketplaceEnabled" BOOLEAN DEFAULT FALSE;
