import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, timestamp, json, boolean } from "drizzle-orm/pg-core";

import { user } from "./user.schema";

export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>; 