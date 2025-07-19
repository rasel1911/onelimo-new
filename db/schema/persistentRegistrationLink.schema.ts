import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar, boolean, text, integer } from "drizzle-orm/pg-core";

/**
 * Schema for persistent partner registration links
 * These links never expire and can be shared across multiple communication channels
 */
export const persistentRegistrationLink = pgTable("PersistentRegistrationLink", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	linkId: varchar("linkId", { length: 50 }).notNull().unique(),
	title: varchar("title", { length: 100 }).notNull(),
	description: text("description"),
	isActive: boolean("isActive").notNull().default(true),
	usageCount: integer("usageCount").notNull().default(0),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type PersistentRegistrationLink = InferSelectModel<typeof persistentRegistrationLink>;
