import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, integer, text, json } from "drizzle-orm/pg-core";

import { user } from "./user.schema";

export type LocationType = {
	city: string;
	address: string;
	lat?: number;
	lng?: number;
	postcode?: string;
};

export const bookingRequest = pgTable("BookingRequest", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	requestCode: varchar("requestCode", { length: 20 }).notNull().unique(),

	userId: uuid("userId")
		.notNull()
		.references(() => user.id),
	customerName: varchar("customerName", { length: 100 }).notNull(),

	pickupLocation: json("pickupLocation").$type<LocationType>().notNull(),
	dropoffLocation: json("dropoffLocation").$type<LocationType>().notNull(),
	pickupTime: timestamp("pickupTime").notNull(),
	estimatedDropoffTime: timestamp("estimatedDropoffTime").notNull(),

	estimatedDuration: integer("estimatedDuration").notNull(), // in minutes

	passengers: integer("passengers").notNull(),
	vehicleType: varchar("vehicleType", { length: 80 }).notNull(),
	specialRequests: text("specialRequests"),

	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type BookingRequest = InferSelectModel<typeof bookingRequest>;
