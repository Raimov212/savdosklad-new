-- Add unique constraint on barcode per business
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_business
ON products (barcode, "businessId")
WHERE barcode IS NOT NULL AND barcode != '' AND "isDeleted" = false;
