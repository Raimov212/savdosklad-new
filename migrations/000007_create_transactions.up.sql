CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    description CHARACTER VARYING(300),
    "productPrice" NUMERIC NOT NULL DEFAULT 0,
    "productQuantity" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER NOT NULL REFERENCES products(id),
    "businessId" INTEGER NOT NULL REFERENCES businesses(id),
    "totalTransactionId" INTEGER NOT NULL REFERENCES total_transactions(id),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
