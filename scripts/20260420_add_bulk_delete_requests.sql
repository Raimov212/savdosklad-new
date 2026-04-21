CREATE TABLE bulk_delete_requests (
    id SERIAL PRIMARY KEY,
    business_id INT NOT NULL,
    category_id INT,
    product_ids TEXT,
    created_by INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
