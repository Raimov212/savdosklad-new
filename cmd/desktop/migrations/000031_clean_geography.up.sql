-- Cleanup duplicate regions that don't have districts
DELETE FROM regions WHERE id NOT IN (SELECT DISTINCT "regionId" FROM districts) 
AND id > 14;

-- Ensure "Andijon viloyati" and similar are the only ones if duplicates exist by name
-- But simpler: just delete any region whose name doesn't match the standard if it's a duplicate
DELETE FROM regions r1 USING regions r2 
WHERE r1.name = r2.name AND r1.id > r2.id;
