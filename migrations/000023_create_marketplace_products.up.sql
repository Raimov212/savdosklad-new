CREATE TABLE IF NOT EXISTS marketplace_products (
    id SERIAL PRIMARY KEY,
    "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "marketplaceCategoryId" INTEGER REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(5,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    images TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
