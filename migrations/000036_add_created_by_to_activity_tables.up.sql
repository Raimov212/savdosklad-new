-- Add createdBy column to main transaction, refund and expense tables
ALTER TABLE total_transactions ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);
ALTER TABLE total_refunds ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);
ALTER TABLE total_expenses ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);

-- Update comments for clarity
COMMENT ON COLUMN total_transactions."createdBy" IS 'The ID of the user (admin or employee) who performed the transaction';
COMMENT ON COLUMN total_refunds."createdBy" IS 'The ID of the user who performed the refund';
COMMENT ON COLUMN total_expenses."createdBy" IS 'The ID of the user who recorded the expense';
