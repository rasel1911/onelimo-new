ALTER TABLE "ServiceProvider" ADD COLUMN "locationIds" uuid[];--> statement-breakpoint
CREATE INDEX "sp_locations_idx" ON "ServiceProvider" USING btree ("locationIds");