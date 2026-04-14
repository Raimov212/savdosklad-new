CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "phoneNumber" TEXT NOT NULL UNIQUE,
    email TEXT,
    password TEXT NOT NULL,
    image TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
