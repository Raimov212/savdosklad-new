-- SQL for markets
-- Toshkent shahri (14)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Abu Saxiy', 'Toshkent halqa yo''li', (SELECT id FROM districts WHERE name = 'Chilonzor tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Bek Baraka', 'Toshkent halqa yo''li', (SELECT id FROM districts WHERE name = 'Chilonzor tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Chorsu bozori', 'Eski shahar', (SELECT id FROM districts WHERE name = 'Shayxontohur tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Qo''yliq bozori', 'Farg''ona yo''li', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Oloy bozori', 'Amir Temur ko''chasi', (SELECT id FROM districts WHERE name = 'Yunusobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Yunusobod bozori', 'Yunusobod 3-kvartal', (SELECT id FROM districts WHERE name = 'Yunusobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('O''rikzor bozori', 'Uchtepa tumani', (SELECT id FROM districts WHERE name = 'Uchtepa tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Parkent bozori', 'Parkent ko''chasi', (SELECT id FROM districts WHERE name = 'Mirzo Ulug''bek tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Malika savdo markazi', 'Bog''ishamol ko''chasi', (SELECT id FROM districts WHERE name = 'Yunusobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Mirobod bozori', 'Mirobod ko''chasi', (SELECT id FROM districts WHERE name = 'Mirobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW());

-- Andijon viloyati (2)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Jahon bozori', 'Andijon shahri', (SELECT id FROM districts WHERE name = 'Andijon shahri' AND "regionId" = 2 LIMIT 1), NOW(), NOW()),
('Eski shahar bozori', 'Andijon shahri', (SELECT id FROM districts WHERE name = 'Andijon shahri' AND "regionId" = 2 LIMIT 1), NOW(), NOW());

-- Namangan viloyati (7)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Chorsu bozori (Namangan)', 'Namangan shahri', (SELECT id FROM districts WHERE name = 'Namangan shahri' AND "regionId" = 7 LIMIT 1), NOW(), NOW()),
('Sardoba bozori', 'Namangan shahri', (SELECT id FROM districts WHERE name = 'Namangan shahri' AND "regionId" = 7 LIMIT 1), NOW(), NOW());

-- Farg'ona viloyati (12)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Qo''qon bozori', 'Qo''qon shahri', (SELECT id FROM districts WHERE name = 'Qo''qon shahri' AND "regionId" = 12 LIMIT 1), NOW(), NOW()),
('Marg''ilon bozori', 'Marg''ilon shahri', (SELECT id FROM districts WHERE name = 'Marg''ilon shahri' AND "regionId" = 12 LIMIT 1), NOW(), NOW());

-- Samarqand viloyati (8)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Siyob bozori', 'Samarqand shahri', (SELECT id FROM districts WHERE name = 'Samarqand shahri' AND "regionId" = 8 LIMIT 1), NOW(), NOW());

-- Reset markets sequence
SELECT setval(pg_get_serial_sequence('markets', 'id'), coalesce(max(id),0) + 1, false) FROM markets;
