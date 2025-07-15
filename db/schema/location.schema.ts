import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const location = pgTable("Location", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  city: varchar("city", { length: 50 }).notNull(),
  zipcodes: varchar("zipcodes", { length: 20 }).array().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Location = InferSelectModel<typeof location>; 