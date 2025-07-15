import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar, index, integer, pgEnum } from "drizzle-orm/pg-core";

import { location } from "./location.schema";

export const serviceTypeEnum = pgEnum("service_type", [
	"suv",
	"party_bus",
	"stretch_limousine",
	"sedan",
	"hummer",
	"other",
	"not_specified",
]);

export const roleEnum = pgEnum("role_type", ["user", "customer", "admin", "support", "partner"]);

export const serviceProvider = pgTable(
	"ServiceProvider",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		name: varchar("name", { length: 100 }).notNull(),
		email: varchar("email", { length: 64 }).notNull().unique(),
		phone: varchar("phone", { length: 20 }).notNull(),
		locationId: uuid("locationId").references(() => location.id),
		serviceType: varchar("serviceType", { length: 50 }).array(),
		areaCovered: varchar("areaCovered", { length: 100 }).array(),
		status: varchar("status", { length: 20 }).notNull().default("pending"),
		role: varchar("role", { length: 20 }).notNull().default("provider"), // remove this with ENUM, delete from db
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
	(table) => {
		return {
			emailIdx: index("sp_email_idx").on(table.email),
			locationIdx: index("sp_location_idx").on(table.locationId),
			statusIdx: index("sp_status_idx").on(table.status),
			roleIdx: index("sp_role_idx").on(table.role),
			pinResetTokenIdx: index("sp_pin_reset_token_idx").on(table.pinResetToken),
			isBlockedIdx: index("sp_is_blocked_idx").on(table.isBlocked),
		};
	},
);

export type ServiceProvider = InferSelectModel<typeof serviceProvider>;
