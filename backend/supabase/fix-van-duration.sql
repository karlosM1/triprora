ALTER TABLE "Van" ADD COLUMN IF NOT EXISTS duration TEXT;
UPDATE "Van" v
SET duration = COALESCE(r."typicalDuration", '6h')
FROM routes r
WHERE r.id = v."routeId"
  AND v.duration IS NULL;
UPDATE "Van" SET duration = '6h' WHERE duration IS NULL;
