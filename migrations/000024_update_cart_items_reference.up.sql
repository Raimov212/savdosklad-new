-- Drop old foreign key and unique constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_productId_fkey;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cartId_productId_key;

-- Rename column for clarity
ALTER TABLE cart_items RENAME COLUMN "productId" TO "marketplaceProductId";

-- Add new foreign key to marketplace_products
ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_marketplace_product_fkey
    FOREIGN KEY ("marketplaceProductId") REFERENCES marketplace_products(id);

-- Add new unique constraint
ALTER TABLE cart_items ADD CONSTRAINT cart_items_cartId_mpid_key UNIQUE("cartId", "marketplaceProductId");
