-- SQL for markets (TO'LIQ VA AVTOMATIK TOZALANADIGAN VERSIYA)
-- Ushbu fayl ishga tushganda avval markets jadvalini tozalaydi va ID ni 1-ga tushiradi.

-- 1. Jadvalni tozalash va ID hisoblagichini 1-ga qaytarish
TRUNCATE TABLE public.markets RESTART IDENTITY CASCADE;

-- 2. Toshkent shahri (14)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Abu Saxiy savdo markazi', 'Toshkent halqa yo''li', (SELECT id FROM districts WHERE name = 'Chilonzor tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Bek Baraka savdo majmuasi', 'Toshkent halqa yo''li', (SELECT id FROM districts WHERE name = 'Chilonzor tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Chorsu dehqon bozori', 'Eski shahar', (SELECT id FROM districts WHERE name = 'Shayxontohur tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Qo''yliq dehqon bozori', 'Farg''ona yo''li', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Oloy bozori', 'Amir Temur ko''chasi', (SELECT id FROM districts WHERE name = 'Yunusobod tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Farhod dehqon bozori', 'Uchtepa tumani', (SELECT id FROM districts WHERE name = 'Uchtepa tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Malika (Fleshka) savdo markazi', 'Kichik halqa yo''li', (SELECT id FROM districts WHERE name = 'Shayxontohur tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW()),
('Food City', 'Bektemir tumani', (SELECT id FROM districts WHERE name = 'Bektemir tumani' AND "regionId" = 14 LIMIT 1), NOW(), NOW());

-- 3. Andijon viloyati (2)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Jahon bozori', 'Andijon shahri', (SELECT id FROM districts WHERE name = 'Andijon shahri' AND "regionId" = 2 LIMIT 1), NOW(), NOW()),
('Andijon eski shahar bozori', 'Andijon shahri', (SELECT id FROM districts WHERE name = 'Andijon shahri' AND "regionId" = 2 LIMIT 1), NOW(), NOW());

-- 4. Farg''ona viloyati (12)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Qo''qon markaziy bozori', 'Qo''qon shahri', (SELECT id FROM districts WHERE name = 'Qo''qon shahri' AND "regionId" = 12 LIMIT 1), NOW(), NOW()),
('Marg''ilon buyum bozori', 'Marg''ilon shahri', (SELECT id FROM districts WHERE name = 'Marg''ilon shahri' AND "regionId" = 12 LIMIT 1), NOW(), NOW()),
('Farg''ona markaziy bozori', 'Farg''ona shahri', (SELECT id FROM districts WHERE name = 'Farg''ona shahri' AND "regionId" = 12 LIMIT 1), NOW(), NOW());

-- 5. Namangan viloyati (7)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Namangan Chorsu bozori', 'Namangan shahri', (SELECT id FROM districts WHERE name = 'Namangan shahri' AND "regionId" = 7 LIMIT 1), NOW(), NOW()),
('Sardoba bozori', 'Namangan shahri', (SELECT id FROM districts WHERE name = 'Namangan shahri' AND "regionId" = 7 LIMIT 1), NOW(), NOW());

-- 6. Samarqand viloyati (8)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Siyob dehqon bozori', 'Samarqand shahri', (SELECT id FROM districts WHERE name = 'Samarqand shahri' AND "regionId" = 8 LIMIT 1), NOW(), NOW()),
('Urgut markaziy bozori', 'Urgut tumani', (SELECT id FROM districts WHERE name = 'Urgut tumani' AND "regionId" = 8 LIMIT 1), NOW(), NOW());

-- 7. Buxoro viloyati (3)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Buxoro markaziy dehqon bozori', 'Buxoro shahri', (SELECT id FROM districts WHERE name = 'Buxoro shahri' AND "regionId" = 3 LIMIT 1), NOW(), NOW()),
('Karvon bozori (Buxoro)', 'Buxoro shahri', (SELECT id FROM districts WHERE name = 'Buxoro shahri' AND "regionId" = 3 LIMIT 1), NOW(), NOW());

-- 8. Qashqadaryo viloyati (5)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Qarshi markaziy dehqon bozori', 'Qarshi shahri', (SELECT id FROM districts WHERE name = 'Qarshi shahri' AND "regionId" = 5 LIMIT 1), NOW(), NOW()),
('Yerqo''rg''on bozori', 'Qarshi shahri', (SELECT id FROM districts WHERE name = 'Qarshi shahri' AND "regionId" = 5 LIMIT 1), NOW(), NOW());

-- 9. Surxondaryo viloyati (9)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Termiz markaziy dehqon bozori', 'Termiz shahri', (SELECT id FROM districts WHERE name = 'Termiz shahri' AND "regionId" = 9 LIMIT 1), NOW(), NOW());

-- 10. Xorazm viloyati (13)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Urganch markaziy dehqon bozori', 'Urganch shahri', (SELECT id FROM districts WHERE name = 'Urganch shahri' AND "regionId" = 13 LIMIT 1), NOW(), NOW());

-- 11. Navoiy viloyati (6)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Navoiy markaziy dehqon bozori', 'Navoiy shahri', (SELECT id FROM districts WHERE name = 'Navoiy shahri' AND "regionId" = 6 LIMIT 1), NOW(), NOW());

-- 12. Jizzax viloyati (4)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Jizzax markaziy dehqon bozori', 'Jizzax shahri', (SELECT id FROM districts WHERE name = 'Jizzax shahri' AND "regionId" = 4 LIMIT 1), NOW(), NOW());

-- 13. Sirdaryo viloyati (10)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Guliston markaziy dehqon bozori', 'Guliston shahri', (SELECT id FROM districts WHERE name = 'Guliston shahri' AND "regionId" = 10 LIMIT 1), NOW(), NOW());

-- 14. Qoraqalpog''iston (1)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Nukus markaziy dehqon bozori', 'Nukus shahri', (SELECT id FROM districts WHERE name = 'Nukus shahri' AND "regionId" = 1 LIMIT 1), NOW(), NOW());

-- 15. Toshkent viloyati (11)
INSERT INTO markets (name, address, "districtId", "createdAt", "updatedAt") VALUES
('Chirchiq dehqon bozori', 'Chirchiq shahri', (SELECT id FROM districts WHERE name = 'Chirchiq shahri' AND "regionId" = 11 LIMIT 1), NOW(), NOW()),
('Olmaliq dehqon bozori', 'Olmaliq shahri', (SELECT id FROM districts WHERE name = 'Olmaliq shahri' AND "regionId" = 11 LIMIT 1), NOW(), NOW());

-- 16. QOLGAN BARCHA TUMANLAR UCHUN AVTOMATIK BOZORLAR QO''SHISH
INSERT INTO markets ("districtId", name, address, "createdAt", "updatedAt")
SELECT id, 
       TRIM(REPLACE(REPLACE(name, ' tumani', ''), ' shahri', '')) || ' markaziy bozori', 
       'Asosiy bozor hududi', 
       NOW(), NOW()
FROM districts
WHERE id NOT IN (SELECT "districtId" FROM markets);
