-- De-duplicate regions by keeping the one with the more complete name
-- For example, "Andijon" will be deleted if "Andijon viloyati" exists
DELETE FROM regions r1 WHERE EXISTS (
    SELECT 1 FROM regions r2 
    WHERE (r2.name LIKE r1.name || ' %' OR r2.name = r1.name || ' viloyati')
    AND r2.id != r1.id
);

-- Delete any regions that STILL don't have districts (these are likely noise)
-- Except for maybe newly created ones (but we haven't added that feature yet)
DELETE FROM regions WHERE id NOT IN (SELECT DISTINCT "regionId" FROM districts);
