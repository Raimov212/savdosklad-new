ALTER TABLE clients ADD CONSTRAINT clients_business_phone_unique UNIQUE ("businessId", phone);
