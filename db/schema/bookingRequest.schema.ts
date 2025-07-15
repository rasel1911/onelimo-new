import { InferSelectModel } from "drizzle-orm";
import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	integer,
	decimal,
	text,
	json,
} from "drizzle-orm/pg-core";

import { user } from "./user.schema";

// Define location type
export type LocationType = {
	city: string;
	postcode: string;
};

// Main booking request schema
export const bookingRequest = pgTable("BookingRequest", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	requestCode: varchar("requestCode", { length: 20 }).notNull().unique(),

	// Who made the booking
	userId: uuid("userId")
		.notNull()
		.references(() => user.id),
	customerName: varchar("customerName", { length: 100 }).notNull(),

	// Journey details
	pickupLocation: json("pickupLocation").$type<LocationType>().notNull(),
	dropoffLocation: json("dropoffLocation").$type<LocationType>().notNull(),
	pickupTime: timestamp("pickupTime").notNull(),
	estimatedDropoffTime: timestamp("estimatedDropoffTime").notNull(),

	// Journey estimates
	estimatedDuration: integer("estimatedDuration").notNull(), // in minutes

	// Booking details
	passengers: integer("passengers").notNull(),
	vehicleType: varchar("vehicleType", { length: 80 }).notNull(),
	specialRequests: text("specialRequests"),

	// Timestamps
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Type definitions
export type BookingRequest = InferSelectModel<typeof bookingRequest>;
