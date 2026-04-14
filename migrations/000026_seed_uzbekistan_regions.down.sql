-- Rollback the seeded regions and districts
-- This simply deletes all regions that were seeded (1 to 14).
-- Because of CASCADE ON DELETE in the districts table, all associated districts will also be deleted.

DELETE FROM regions WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);

-- Reset sequences just in case
SELECT setval(pg_get_serial_sequence('districts', 'id'), coalesce(max(id),0) + 1, false) FROM districts;
SELECT setval(pg_get_serial_sequence('regions', 'id'), coalesce(max(id),0) + 1, false) FROM regions;
