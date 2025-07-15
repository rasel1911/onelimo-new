import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";

/**
 * Schema for partner registration tokens
 * Used to validate and track partner registration invitations
 */
export const registrationToken = pgTable("RegistrationToken", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  token: varchar("token", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 100 }),
  isUsed: boolean("isUsed").notNull().default(false),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type RegistrationToken = InferSelectModel<typeof registrationToken>;