CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "orgName" CHARACTER VARYING(200) NOT NULL,
    "orgType" CHARACTER VARYING(10) NOT NULL DEFAULT 'YATT',
    "stir" CHARACTER VARYING(9),
    "logo" TEXT DEFAULT '',
    "legalAddress" TEXT,
    "phoneNumber" CHARACTER VARYING(20),
    "email" CHARACTER VARYING(100),
    "bankName" CHARACTER VARYING(100),
    "bankAccount" CHARACTER VARYING(25),
    "mfo" CHARACTER VARYING(5),
    "regionId" INTEGER REFERENCES regions(id),
    "districtId" INTEGER REFERENCES districts(id),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "organizationId" INTEGER REFERENCES organizations(id);
