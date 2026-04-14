ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cartId_mpid_key;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_marketplace_product_fkey;
ALTER TABLE cart_items RENAME COLUMN "marketplaceProductId" TO "productId";
ALTER TABLE cart_items ADD CONSTRAINT cart_items_productId_fkey FOREIGN KEY ("productId") REFERENCES products(id);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_cartId_productId_key UNIQUE("cartId", "productId");
