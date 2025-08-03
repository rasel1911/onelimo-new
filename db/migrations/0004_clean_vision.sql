DROP TYPE "public"."service_type";--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('suv', 'party_bus', 'stretch_limousine', 'sedan', 'hummer', 'other');--> statement-breakpoint
ALTER TABLE "ServiceProvider" ADD COLUMN "serviceLocations" varchar(100)[];--> statement-breakpoint
CREATE INDEX "sp_service_locations_idx" ON "ServiceProvider" USING btree ("serviceLocations");