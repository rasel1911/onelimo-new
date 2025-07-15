import { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "service_provider", "support"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "deleted"]);

export const user = pgTable("User", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	name: varchar("name", { length: 100 }).notNull(),
	email: varchar("email", { length: 64 }).notNull(),
	phone: varchar("phone", { length: 20 }).notNull(),
	password: varchar("password", { length: 64 }),
	role: userRoleEnum("role").default("user").notNull(),
	status: userStatusEnum("status").default("active").notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof user>;
