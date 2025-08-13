import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { serviceProvider } from "./serviceProvider.schema";
import { bookingRequest } from "./bookingRequest.schema";

export const communication = pgTable("Communication", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	serviceProviderId: uuid("serviceProviderId")
		.notNull()
		.references(() => serviceProvider.id),
	bookingRequestId: uuid("bookingRequestId")
		.notNull()
		.references(() => bookingRequest.id),
	subject: varchar("subject", { length: 200 }),
	status: varchar("status", { length: 20 }).notNull().default("pending"),
	progress: integer("progress").notNull().default(0),
	text: varchar("text", { length: 1000 }),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Communication = InferSelectModel<typeof communication>;
