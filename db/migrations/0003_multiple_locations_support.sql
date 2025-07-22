-- Migration: Add support for multiple locations for service providers
-- Add new locationIds array field alongside existing locationId field

-- Step 1: Add new locationIds column as array (nullable for now)
ALTER TABLE "ServiceProvider" ADD COLUMN "locationIds" uuid[];

-- Step 2: Create index for the new locationIds array column
CREATE INDEX "sp_locations_idx" ON "ServiceProvider" USING GIN ("locationIds");

-- Step 3: Populate locationIds with existing locationId data where it exists
UPDATE "ServiceProvider" 
SET "locationIds" = ARRAY["locationId"]
WHERE "locationId" IS NOT NULL; 