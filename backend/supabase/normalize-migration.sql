-- Triprora normalized schema migration
-- Run once against an existing database BEFORE deploying the normalized backend:
--   npx prisma db execute --file supabase/normalize-migration.sql --schema prisma/schema.prisma
-- Then:
--   npx prisma db push

BEGIN;

CREATE TYPE "DriverDocumentType" AS ENUM ('profile_photo', 'license_front', 'license_back');
CREATE TYPE "VehicleDocumentType" AS ENUM ('cr', 'or', 'insurance', 'inspection');

CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  "departureLocation" TEXT NOT NULL,
  "arrivalLocation" TEXT NOT NULL,
  "typicalDuration" TEXT,
  UNIQUE ("departureLocation", "arrivalLocation")
);

CREATE TABLE IF NOT EXISTS van_classes (
  id TEXT PRIMARY KEY,
  "classType" TEXT NOT NULL,
  "classVariant" TEXT NOT NULL,
  "baseCapacity" INTEGER,
  UNIQUE ("classType", "classVariant")
);

CREATE TABLE IF NOT EXISTS amenities (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS van_amenities (
  "vanId" TEXT NOT NULL,
  "amenityId" TEXT NOT NULL,
  PRIMARY KEY ("vanId", "amenityId")
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  "ownerProfileId" UUID NOT NULL,
  "plateNumber" TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  "photoUrl" TEXT
);

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id TEXT PRIMARY KEY,
  "vehicleId" TEXT NOT NULL,
  type "VehicleDocumentType" NOT NULL,
  url TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  UNIQUE ("vehicleId", type)
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  "houseStreet" TEXT NOT NULL,
  barangay TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  "zipCode" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS driver_bank_accounts (
  id TEXT PRIMARY KEY,
  "gcashNumber" TEXT,
  "accountName" TEXT,
  "bankName" TEXT,
  "accountNumber" TEXT
);

CREATE TABLE IF NOT EXISTS driver_documents (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  type "DriverDocumentType" NOT NULL,
  url TEXT NOT NULL,
  UNIQUE ("applicationId", type)
);

CREATE TABLE IF NOT EXISTS booking_snapshots (
  "bookingId" TEXT PRIMARY KEY,
  "routeCode" TEXT,
  "routeLabel" TEXT NOT NULL,
  "imageUrl" TEXT,
  "departureDate" TEXT NOT NULL,
  "departureTime" TEXT,
  "seatLabel" TEXT NOT NULL,
  "vehicleLabel" TEXT,
  "tripType" TEXT,
  "baseFareCents" INTEGER NOT NULL DEFAULT 0,
  "serviceFeeCents" INTEGER NOT NULL DEFAULT 0,
  "taxCents" INTEGER NOT NULL DEFAULT 0,
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PHP',
  "priceDisplay" TEXT NOT NULL DEFAULT ''
);

INSERT INTO amenities (id, key)
VALUES
  ('amenity_wifi', 'wifi'),
  ('amenity_usb', 'usb'),
  ('amenity_reclining', 'reclining'),
  ('amenity_ac', 'ac'),
  ('amenity_luggage', 'luggage'),
  ('amenity_legroom', 'legroom'),
  ('amenity_entertainment', 'entertainment'),
  ('amenity_snacks', 'snacks'),
  ('amenity_monitor', 'monitor')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE "Van"
  ADD COLUMN IF NOT EXISTS "routeId" TEXT,
  ADD COLUMN IF NOT EXISTS "operatorId" TEXT,
  ADD COLUMN IF NOT EXISTS "vanClassId" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;

INSERT INTO operators (id, name)
SELECT 'op_' || md5(operator), operator
FROM (SELECT DISTINCT operator FROM "Van") source
ON CONFLICT (name) DO NOTHING;

INSERT INTO routes (id, "departureLocation", "arrivalLocation", "typicalDuration")
SELECT 'route_' || md5("departureLocation" || '->' || "arrivalLocation"),
       "departureLocation",
       "arrivalLocation",
       duration
FROM (SELECT DISTINCT "departureLocation", "arrivalLocation", duration FROM "Van") source
ON CONFLICT ("departureLocation", "arrivalLocation") DO NOTHING;

INSERT INTO van_classes (id, "classType", "classVariant", "baseCapacity")
SELECT 'class_' || md5("classType" || ':' || "classVariant"),
       "classType",
       "classVariant",
       MAX("totalSeats")
FROM "Van"
GROUP BY "classType", "classVariant"
ON CONFLICT ("classType", "classVariant") DO NOTHING;

UPDATE "Van" v
SET "operatorId" = o.id
FROM operators o
WHERE o.name = v.operator
  AND v."operatorId" IS NULL;

UPDATE "Van" v
SET "routeId" = r.id
FROM routes r
WHERE r."departureLocation" = v."departureLocation"
  AND r."arrivalLocation" = v."arrivalLocation"
  AND v."routeId" IS NULL;

UPDATE "Van" v
SET "vanClassId" = c.id
FROM van_classes c
WHERE c."classType" = v."classType"
  AND c."classVariant" = v."classVariant"
  AND v."vanClassId" IS NULL;

INSERT INTO van_amenities ("vanId", "amenityId")
SELECT v.id, a.id
FROM "Van" v
CROSS JOIN LATERAL unnest(v."amenityKeys") AS amenity_key(key)
JOIN amenities a ON a.key = amenity_key.key
ON CONFLICT DO NOTHING;

ALTER TABLE driver_applications
  ADD COLUMN IF NOT EXISTS "addressId" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactId" TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountId" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;

DO $$
DECLARE
  app RECORD;
  address_id TEXT;
  emergency_id TEXT;
  bank_id TEXT;
  vehicle_id TEXT;
BEGIN
  FOR app IN
    SELECT *
    FROM driver_applications
    WHERE "addressId" IS NULL
  LOOP
    address_id := 'addr_' || app.id;
    emergency_id := 'ec_' || app.id;
    vehicle_id := 'veh_' || app.id;

    INSERT INTO addresses (id, "houseStreet", barangay, city, province, "zipCode")
    VALUES (
      address_id,
      app."houseStreet",
      app.barangay,
      app.city,
      app.province,
      app."zipCode"
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO emergency_contacts (id, name, relationship, phone)
    VALUES (
      emergency_id,
      app."emergencyContactName",
      app."emergencyContactRelationship",
      app."emergencyContactPhone"
    )
    ON CONFLICT (id) DO NOTHING;

    IF app."gcashNumber" IS NOT NULL
      OR app."bankAccountName" IS NOT NULL
      OR app."bankName" IS NOT NULL
      OR app."bankAccountNumber" IS NOT NULL THEN
      bank_id := 'bank_' || app.id;
      INSERT INTO driver_bank_accounts (id, "gcashNumber", "accountName", "bankName", "accountNumber")
      VALUES (
        bank_id,
        app."gcashNumber",
        app."bankAccountName",
        app."bankName",
        app."bankAccountNumber"
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;

    INSERT INTO vehicles (
      id,
      "ownerProfileId",
      "plateNumber",
      make,
      model,
      year,
      color,
      capacity,
      "photoUrl"
    )
    VALUES (
      vehicle_id,
      app."profileId",
      app."vehiclePlateNumber",
      app."vehicleMake",
      app."vehicleModel",
      app."vehicleYear",
      app."vehicleColor",
      app."vehicleCapacity",
      app."vehiclePhotoUrl"
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO vehicle_documents (id, "vehicleId", type, url)
    VALUES
      ('vd_cr_' || app.id, vehicle_id, 'cr', app."crDocumentUrl"),
      ('vd_or_' || app.id, vehicle_id, 'or', app."orDocumentUrl"),
      ('vd_ins_' || app.id, vehicle_id, 'insurance', app."insuranceDocumentUrl")
    ON CONFLICT ("vehicleId", type) DO NOTHING;

    IF app."inspectionDocumentUrl" IS NOT NULL THEN
      INSERT INTO vehicle_documents (id, "vehicleId", type, url)
      VALUES ('vd_insp_' || app.id, vehicle_id, 'inspection', app."inspectionDocumentUrl")
      ON CONFLICT ("vehicleId", type) DO NOTHING;
    END IF;

    IF app."profilePhotoUrl" IS NOT NULL THEN
      INSERT INTO driver_documents (id, "applicationId", type, url)
      VALUES ('dd_photo_' || app.id, app.id, 'profile_photo', app."profilePhotoUrl")
      ON CONFLICT ("applicationId", type) DO NOTHING;
    END IF;

    INSERT INTO driver_documents (id, "applicationId", type, url)
    VALUES
      ('dd_lf_' || app.id, app.id, 'license_front', app."licenseFrontUrl"),
      ('dd_lb_' || app.id, app.id, 'license_back', app."licenseBackUrl")
    ON CONFLICT ("applicationId", type) DO NOTHING;

    UPDATE driver_applications
    SET
      "addressId" = address_id,
      "emergencyContactId" = emergency_id,
      "bankAccountId" = bank_id,
      "vehicleId" = vehicle_id
    WHERE id = app.id;
  END LOOP;
END $$;

UPDATE "Van" v
SET "vehicleId" = da."vehicleId"
FROM driver_applications da
WHERE da."profileId" = v."driverId"
  AND da.status = 'approved'
  AND v."vehicleId" IS NULL;

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "seatId" TEXT;

UPDATE "Booking" b
SET "seatId" = s.id
FROM "Seat" s
WHERE s."vanId" = b."vanId"
  AND s.label = b.seat
  AND b."seatId" IS NULL;

INSERT INTO booking_snapshots (
  "bookingId",
  "routeCode",
  "routeLabel",
  "imageUrl",
  "departureDate",
  "departureTime",
  "seatLabel",
  "vehicleLabel",
  "tripType",
  "baseFareCents",
  "serviceFeeCents",
  "taxCents",
  "totalCents",
  "priceDisplay"
)
SELECT
  b.id,
  b."routeCode",
  b.route,
  b.image,
  b.date,
  b.time,
  COALESCE(b.seat, ''),
  b.vehicle,
  b."tripType",
  0,
  0,
  0,
  0,
  COALESCE(b.price, '')
FROM "Booking" b
LEFT JOIN booking_snapshots s ON s."bookingId" = b.id
WHERE s."bookingId" IS NULL;

ALTER TABLE "Van"
  DROP COLUMN IF EXISTS "classType",
  DROP COLUMN IF EXISTS "classVariant",
  DROP COLUMN IF EXISTS "departureLocation",
  DROP COLUMN IF EXISTS "arrivalLocation",
  DROP COLUMN IF EXISTS operator,
  DROP COLUMN IF EXISTS "amenityKeys",
  DROP COLUMN IF EXISTS "vehicleName",
  DROP COLUMN IF EXISTS "plateNumber";

ALTER TABLE driver_applications
  DROP COLUMN IF EXISTS "profilePhotoUrl",
  DROP COLUMN IF EXISTS "houseStreet",
  DROP COLUMN IF EXISTS barangay,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS province,
  DROP COLUMN IF EXISTS "zipCode",
  DROP COLUMN IF EXISTS "licenseFrontUrl",
  DROP COLUMN IF EXISTS "licenseBackUrl",
  DROP COLUMN IF EXISTS "vehiclePlateNumber",
  DROP COLUMN IF EXISTS "vehicleMake",
  DROP COLUMN IF EXISTS "vehicleModel",
  DROP COLUMN IF EXISTS "vehicleYear",
  DROP COLUMN IF EXISTS "vehicleColor",
  DROP COLUMN IF EXISTS "vehicleCapacity",
  DROP COLUMN IF EXISTS "vehiclePhotoUrl",
  DROP COLUMN IF EXISTS "crDocumentUrl",
  DROP COLUMN IF EXISTS "orDocumentUrl",
  DROP COLUMN IF EXISTS "insuranceDocumentUrl",
  DROP COLUMN IF EXISTS "inspectionDocumentUrl",
  DROP COLUMN IF EXISTS "emergencyContactName",
  DROP COLUMN IF EXISTS "emergencyContactRelationship",
  DROP COLUMN IF EXISTS "emergencyContactPhone",
  DROP COLUMN IF EXISTS "gcashNumber",
  DROP COLUMN IF EXISTS "bankAccountName",
  DROP COLUMN IF EXISTS "bankName",
  DROP COLUMN IF EXISTS "bankAccountNumber";

ALTER TABLE "Booking"
  DROP COLUMN IF EXISTS "routeCode",
  DROP COLUMN IF EXISTS image,
  DROP COLUMN IF EXISTS date,
  DROP COLUMN IF EXISTS time,
  DROP COLUMN IF EXISTS seat,
  DROP COLUMN IF EXISTS route,
  DROP COLUMN IF EXISTS vehicle,
  DROP COLUMN IF EXISTS "tripType",
  DROP COLUMN IF EXISTS price;

COMMIT;
