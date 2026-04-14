ALTER TABLE total_transactions DROP COLUMN IF EXISTS "createdBy";
ALTER TABLE total_refunds DROP COLUMN IF EXISTS "createdBy";
ALTER TABLE total_expenses DROP COLUMN IF EXISTS "createdBy";
