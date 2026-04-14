-- Remove geography columns from businesses table
ALTER TABLE businesses DROP COLUMN IF EXISTS "regionId";
ALTER TABLE businesses DROP COLUMN IF EXISTS "districtId";
ALTER TABLE businesses DROP COLUMN IF EXISTS "marketId";
