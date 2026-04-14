-- Fix all NUMERIC columns to use NUMERIC(15,2) for proper precision

-- businesses
ALTER TABLE businesses ALTER COLUMN balance TYPE NUMERIC(15,2);

-- products
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(15,2);
ALTER TABLE products ALTER COLUMN discount TYPE NUMERIC(15,2);

-- total_transactions
ALTER TABLE total_transactions ALTER COLUMN total TYPE NUMERIC(15,2);
ALTER TABLE total_transactions ALTER COLUMN cash TYPE NUMERIC(15,2);
ALTER TABLE total_transactions ALTER COLUMN card TYPE NUMERIC(15,2);
ALTER TABLE total_transactions ALTER COLUMN click TYPE NUMERIC(15,2);
ALTER TABLE total_transactions ALTER COLUMN debt TYPE NUMERIC(15,2);

-- transactions
ALTER TABLE transactions ALTER COLUMN "productPrice" TYPE NUMERIC(15,2);

-- total_refunds
ALTER TABLE total_refunds ALTER COLUMN total TYPE NUMERIC(15,2);
ALTER TABLE total_refunds ALTER COLUMN cash TYPE NUMERIC(15,2);
ALTER TABLE total_refunds ALTER COLUMN card TYPE NUMERIC(15,2);
ALTER TABLE total_refunds ALTER COLUMN click TYPE NUMERIC(15,2);
ALTER TABLE total_refunds ALTER COLUMN debt TYPE NUMERIC(15,2);

-- refunds
ALTER TABLE refunds ALTER COLUMN "productPrice" TYPE NUMERIC(15,2);

-- total_expenses
ALTER TABLE total_expenses ALTER COLUMN total TYPE NUMERIC(15,2);
ALTER TABLE total_expenses ALTER COLUMN cash TYPE NUMERIC(15,2);
ALTER TABLE total_expenses ALTER COLUMN card TYPE NUMERIC(15,2);

-- expenses
ALTER TABLE expenses ALTER COLUMN value TYPE NUMERIC(15,2);

-- fixed_costs
ALTER TABLE fixed_costs ALTER COLUMN amount TYPE NUMERIC(15,2);

-- fixed_facted_costs
ALTER TABLE fixed_facted_costs ALTER COLUMN amount TYPE NUMERIC(15,2);

-- money
ALTER TABLE money ALTER COLUMN value TYPE NUMERIC(15,2);

-- calculations
ALTER TABLE calculations ALTER COLUMN "totalIncome" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "incomeTax" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "totalExpense" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "totalFixedCosts" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN salary TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "salaryTax" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN profit TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "totalSale" TYPE NUMERIC(15,2);
ALTER TABLE calculations ALTER COLUMN "addedMoney" TYPE NUMERIC(15,2);
