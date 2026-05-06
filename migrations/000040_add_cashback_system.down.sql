ALTER TABLE transactions DROP COLUMN IF EXISTS "cashbackAmount";
ALTER TABLE total_transactions DROP COLUMN IF EXISTS "cashbackUsed";
ALTER TABLE total_transactions DROP COLUMN IF EXISTS "cashbackEarned";

DROP TABLE IF EXISTS cashback_tiers;

ALTER TABLE products DROP COLUMN IF EXISTS "cashbackPercentage";

ALTER TABLE clients DROP COLUMN IF EXISTS "totalSpent";
ALTER TABLE clients DROP COLUMN IF EXISTS "cashbackBalance";

ALTER TABLE businesses DROP COLUMN IF EXISTS "cashbackPercentage";
ALTER TABLE businesses DROP COLUMN IF EXISTS "cashbackType";
ALTER TABLE businesses DROP COLUMN IF EXISTS "cashbackEnabled";
