import { genSaltSync, hashSync } from "bcrypt-ts";
import { eq, and, or } from "drizzle-orm";

import { db } from "./script-connection";
import { User, user } from "../db/schema";

export async function getUser(email: string): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.email, email));
	} catch (error) {
		console.error("Failed to get user from database");
		throw error;
	}
}

export async function getUserByPhone(phone: string): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.phone, phone));
	} catch (error) {
		console.error("Failed to get user by phone from database");
		throw error;
	}
}

export async function getUserByEmailOrPhone(emailOrPhone: string): Promise<Array<User>> {
	try {
		return await db
			.select()
			.from(user)
			.where(or(eq(user.email, emailOrPhone), eq(user.phone, emailOrPhone)));
	} catch (error) {
		console.error("Failed to get user by email or phone from database");
		throw error;
	}
}

export async function createUser(
	email: string,
	password: string,
	name: string,
	phone: string,
	options?: {
		role?: "user" | "admin" | "service_provider" | "support";
		status?: "active" | "inactive" | "deleted";
	},
): Promise<any> {
	let salt = genSaltSync(10);
	let hash = hashSync(password, salt);

	const userData = {
		email,
		password: hash,
		name,
		phone,
		role: options?.role || "user",
		status: options?.status || "active",
	};

	try {
		return await db.insert(user).values(userData);
	} catch (error) {
		console.error("Failed to create user in database");
		throw error;
	}
}

export async function getUserById(id: string): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.id, id));
	} catch (error) {
		console.error("Failed to get user from database");
		throw error;
	}
}

export async function updateUser(
	id: string,
	updates: {
		name?: string;
		email?: string;
		phone?: string;
		role?: "user" | "admin" | "service_provider" | "support";
		status?: "active" | "inactive" | "deleted";
		password?: string;
	},
): Promise<any> {
	const updateData: any = { ...updates };

	if (updates.password) {
		let salt = genSaltSync(10);
		updateData.password = hashSync(updates.password, salt);
	}

	updateData.updated_at = new Date();

	try {
		return await db.update(user).set(updateData).where(eq(user.id, id));
	} catch (error) {
		console.error("Failed to update user in database");
		throw error;
	}
}

export async function isUserAdmin(id: string): Promise<boolean> {
	try {
		const result = await db
			.select({ role: user.role, status: user.status })
			.from(user)
			.where(eq(user.id, id))
			.limit(1);

		return result.length > 0 && result[0].role === "admin" && result[0].status === "active";
	} catch (error) {
		console.error("Failed to check if user is admin");
		throw error;
	}
}

export async function checkUserRole(
	id: string,
	targetRole: "user" | "admin" | "service_provider" | "support",
): Promise<boolean> {
	try {
		const result = await db
			.select({ role: user.role, status: user.status })
			.from(user)
			.where(eq(user.id, id))
			.limit(1);

		return result.length > 0 && result[0].role === targetRole && result[0].status === "active";
	} catch (error) {
		console.error("Failed to check user role");
		throw error;
	}
}

export async function getUserRole(id: string): Promise<string | null> {
	try {
		const result = await db
			.select({ role: user.role, status: user.status })
			.from(user)
			.where(eq(user.id, id))
			.limit(1);

		if (result.length > 0 && result[0].status === "active") {
			return result[0].role;
		}

		return null;
	} catch (error) {
		console.error("Failed to get user role");
		throw error;
	}
}

export async function getActiveUsers(): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.status, "active"));
	} catch (error) {
		console.error("Failed to get active users from database");
		throw error;
	}
}

export async function getUsersByRole(
	role: "user" | "admin" | "service_provider" | "support",
): Promise<Array<User>> {
	try {
		return await db
			.select()
			.from(user)
			.where(and(eq(user.role, role), eq(user.status, "active")));
	} catch (error) {
		console.error("Failed to get users by role from database");
		throw error;
	}
}

export async function softDeleteUser(id: string): Promise<any> {
	try {
		return await db
			.update(user)
			.set({
				status: "deleted",
				updated_at: new Date(),
			})
			.where(eq(user.id, id));
	} catch (error) {
		console.error("Failed to soft delete user in database");
		throw error;
	}
}
