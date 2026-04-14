-- Migrate existing role=0 users (formerly "Oddiy") to role=1 (Admin/Biznes egasi)
-- Since all self-registered users should be Admin level, not Employee
-- Employee (role=0) will now only be created by Admins
UPDATE users SET role = 1 WHERE role = 0;

-- Add brandName and brandImage columns if not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS "brandName" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "brandImage" TEXT;

-- Add comment for role field documentation
COMMENT ON COLUMN users.role IS '0=Employee, 1=Admin, 2=SuperAdmin, 3=Client';
