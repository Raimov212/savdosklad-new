-- Aggressively de-duplicate and clean geography data
-- 1. Keep the standard IDs (1-14) as they are correctly linked to districts in migration 000026
-- 2. Delete any region with id > 14 that has a similar or matching name to the standard ones
DELETE FROM regions r1 
WHERE r1.id > 14 
AND EXISTS (
    SELECT 1 FROM regions r2 
    WHERE r2.id <= 14 
    AND (r1.name ILIKE r2.name || '%' OR r2.name ILIKE r1.name || '%')
);

-- 3. Safety: Delete any regions that STILL don't have districts (these are noise/broken)
-- districts are linked to regionId 1-14
DELETE FROM regions 
WHERE id NOT IN (SELECT DISTINCT "regionId" FROM districts);

-- 4. Clean up any districts/markets that might have been left orphaned (though CASCADE should handle it, just to be safe)
DELETE FROM districts WHERE "regionId" NOT IN (SELECT id FROM regions);
DELETE FROM markets WHERE "districtId" NOT IN (SELECT id FROM districts);
