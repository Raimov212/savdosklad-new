-- Junction table for multiple businesses per user (especially employees)
CREATE TABLE IF NOT EXISTS user_businesses (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, business_id)
);

-- Migrate existing marketId to user_businesses to support multi-business access immediately
INSERT INTO user_businesses (user_id, business_id) 
SELECT id, "marketId" FROM users WHERE "marketId" IS NOT NULL 
ON CONFLICT DO NOTHING;
