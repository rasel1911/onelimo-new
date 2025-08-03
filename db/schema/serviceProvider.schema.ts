import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar, index, integer, pgEnum } from "drizzle-orm/pg-core";

import { location } from "./location.schema";

export const serviceProvider = pgTable(
	"ServiceProvider",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		name: varchar("name", { length: 100 }).notNull(),
		email: varchar("email", { length: 64 }).notNull().unique(),
		phone: varchar("phone", { length: 20 }).notNull(),
		// FIXME: Remove locationId and locationIds(deprecated later)
		locationId: uuid("locationId").references(() => location.id), // deprecated
		locationIds: uuid("locationIds").array(),
		serviceLocations: varchar("serviceLocations", { length: 100 }).array(), // City names from location suggestions
		serviceType: varchar("serviceType", { length: 50 }).array(),
		areaCovered: varchar("areaCovered", { length: 100 }).array(),
		status: varchar("status", { length: 20 }).notNull().default("pending"),
		role: varchar("role", { length: 20 }).notNull().default("provider"),
		reputation: integer("reputation").default(0),
		responseTime: integer("responseTime").default(0),

		pinHash: varchar("pinHash", { length: 255 }),
		pinSalt: varchar("pinSalt", { length: 255 }),
		pinSetAt: timestamp("pinSetAt"),
		failedPinAttempts: integer("failedPinAttempts").default(0),
		lastFailedPinAttempt: timestamp("lastFailedPinAttempt"),
		isBlocked: varchar("isBlocked", { length: 10 }).default("false"),
		blockedAt: timestamp("blockedAt"),

		pinResetToken: varchar("pinResetToken", { length: 255 }),
		pinResetTokenExpiresAt: timestamp("pinResetTokenExpiresAt"),
		pinResetRequestedAt: timestamp("pinResetRequestedAt"),

		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		index("sp_email_idx").on(table.email),
		index("sp_location_idx").on(table.locationId),
		index("sp_locations_idx").on(table.locationIds),
		index("sp_service_locations_idx").on(table.serviceLocations),
		index("sp_status_idx").on(table.status),
		index("sp_role_idx").on(table.role),
		index("sp_pin_reset_token_idx").on(table.pinResetToken),
		index("sp_is_blocked_idx").on(table.isBlocked),
	],
);

export type ServiceProvider = InferSelectModel<typeof serviceProvider>;
