-- SQL for expanded markets
-- Includes Tashkent City additional markets and main markets in regional centers

-- 1. Toshkent shahri (14) - Qo'shimcha bozorlar va savdo markazlari
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Food City', 'Bektemir tumani', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Compass Mall', 'Bektemir tumani', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Riviera Mall', 'Olmazor tumani', (SELECT id FROM districts WHERE name = 'Olmazor tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Next Mall', 'Yakkasaroy tumani', (SELECT id FROM districts WHERE name = 'Yakkasaroy tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Mega Planet', 'Yunusobod tumani', (SELECT id FROM districts WHERE name = 'Yunusobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Samarqand Darvoza', 'Shayxontohur tumani', (SELECT id FROM districts WHERE name = 'Shayxontohur tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Karvon bozori', 'Uchtepa tumani', (SELECT id FROM districts WHERE name = 'Uchtepa tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Qo''yliq kiyim bozori', 'Bektemir tumani', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Eski Juva bozori', 'Shayxontohur tumani', (SELECT id FROM districts WHERE name = 'Shayxontohur tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW());

-- 2. Qoraqalpog'iston (1)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Nukus)', 'Nukus shahri', (SELECT id FROM districts WHERE name = 'Nukus shahri' AND "regionId" = 1 LIMIT 1), NOW(), NOW());

-- 3. Buxoro viloyati (3)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Buxoro)', 'Buxoro shahri', (SELECT id FROM districts WHERE name = 'Buxoro shahri' AND "regionId" = 3 LIMIT 1), NOW(), NOW()),
('Karvon bozori (Buxoro)', 'Buxoro shahri', (SELECT id FROM districts WHERE name = 'Buxoro shahri' AND "regionId" = 3 LIMIT 1), NOW(), NOW());

-- 4. Jizzax viloyati (4)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Jizzax)', 'Jizzax shahri', (SELECT id FROM districts WHERE name = 'Jizzax shahri' AND "regionId" = 4 LIMIT 1), NOW(), NOW()),
('Eski shahar bozori (Jizzax)', 'Jizzax shahri', (SELECT id FROM districts WHERE name = 'Jizzax shahri' AND "regionId" = 4 LIMIT 1), NOW(), NOW());

-- 5. Qashqadaryo viloyati (5)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Qarshi)', 'Qarshi shahri', (SELECT id FROM districts WHERE name = 'Qarshi shahri' AND "regionId" = 5 LIMIT 1), NOW(), NOW()),
('Yerqo''rg''on bozori', 'Qarshi shahri', (SELECT id FROM districts WHERE name = 'Qarshi shahri' AND "regionId" = 5 LIMIT 1), NOW(), NOW());

-- 6. Navoiy viloyati (6)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Navoiy)', 'Navoiy shahri', (SELECT id FROM districts WHERE name = 'Navoiy shahri' AND "regionId" = 6 LIMIT 1), NOW(), NOW()),
('Saxovat bozori (Navoiy)', 'Navoiy shahri', (SELECT id FROM districts WHERE name = 'Navoiy shahri' AND "regionId" = 6 LIMIT 1), NOW(), NOW());

-- 7. Surxondaryo viloyati (9)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Termiz)', 'Termiz shahri', (SELECT id FROM districts WHERE name = 'Termiz shahri' AND "regionId" = 9 LIMIT 1), NOW(), NOW()),
('Yubiley bozori', 'Termiz shahri', (SELECT id FROM districts WHERE name = 'Termiz shahri' AND "regionId" = 9 LIMIT 1), NOW(), NOW());

-- 8. Sirdaryo viloyati (10)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Guliston)', 'Guliston shahri', (SELECT id FROM districts WHERE name = 'Guliston shahri' AND "regionId" = 10 LIMIT 1), NOW(), NOW());

-- 9. Xorazm viloyati (13)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Markaziy dehqon bozori (Urganch)', 'Urganch shahri', (SELECT id FROM districts WHERE name = 'Urganch shahri' AND "regionId" = 13 LIMIT 1), NOW(), NOW()),
('Eski shahar bozori (Urganch)', 'Urganch shahri', (SELECT id FROM districts WHERE name = 'Urganch shahri' AND "regionId" = 13 LIMIT 1), NOW(), NOW());

-- 10. Toshkent viloyati (11)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Chirchiq dehqon bozori', 'Chirchiq shahri', (SELECT id FROM districts WHERE name = 'Chirchiq shahri' AND "regionId" = 11 LIMIT 1), NOW(), NOW()),
('Angren dehqon bozori', 'Angren shahri', (SELECT id FROM districts WHERE name = 'Angren shahri' AND "regionId" = 11 LIMIT 1), NOW(), NOW()),
('Olmaliq dehqon bozori', 'Olmaliq shahri', (SELECT id FROM districts WHERE name = 'Olmaliq shahri' AND "regionId" = 11 LIMIT 1), NOW(), NOW());

-- Reset markets sequence
SELECT setval(pg_get_serial_sequence('markets', 'id'), coalesce(max(id),0) + 1, false) FROM markets;
