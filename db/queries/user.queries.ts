import { genSaltSync, hashSync } from "bcrypt-ts";
import { eq, and, or } from "drizzle-orm";

import db from "@/db/connection";
import { User, user } from "@/db/schema";

/**
 * @description Get a user by email
 * @param email - The email of the user
 * @returns The user
 */
export const getUser = async (email: string): Promise<Array<User>> => {
	try {
		return await db.select().from(user).where(eq(user.email, email));
	} catch (error) {
		console.error("Failed to get user from database");
		throw error;
	}
};

/**
 * @description	Get a user by phone
 * @param phone - The phone of the user
 * @returns The user
 */
export const getUserByPhone = async (phone: string): Promise<Array<User>> => {
	try {
		return await db.select().from(user).where(eq(user.phone, phone));
	} catch (error) {
		console.error("Failed to get user by phone from database");
		throw error;
	}
};

/**
 * @description Get a user by email or phone
 * @param emailOrPhone - The email or phone of the user
 * @returns The user
 */
export const getUserByEmailOrPhone = async (emailOrPhone: string): Promise<Array<User>> => {
	try {
		return await db
			.select()
			.from(user)
			.where(or(eq(user.email, emailOrPhone), eq(user.phone, emailOrPhone)));
	} catch (error) {
		console.error("Failed to get user by email or phone from database");
		throw error;
	}
};

/**
 * @description Create a user
 * @param email - The email of the user
 * @param password - The password of the user
 * @param name - The name of the user
 * @param phone - The phone of the user
 * @param options - The options for the user
 * @returns The user
 */
export const createUser = async (
	email: string,
	password: string,
	name: string,
	phone: string,
	options?: {
		role?: "user" | "admin" | "service_provider" | "support";
		status?: "active" | "inactive" | "deleted";
	},
): Promise<any> => {
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
};

/**
 * @description Get a user by id
 * @param id - The id of the user
 * @returns The user
 */
export const getUserById = async (id: string): Promise<Array<User>> => {
	try {
		return await db.select().from(user).where(eq(user.id, id));
	} catch (error) {
		console.error("Failed to get user from database");
		throw error;
	}
};

/**
 * @description Update a user
 * @param id - The id of the user
 * @param updates - The updates to the user
 * @returns The user
 */
export const updateUser = async (
	id: string,
	updates: {
		name?: string;
		email?: string;
		phone?: string;
		role?: "user" | "admin" | "service_provider" | "support";
		status?: "active" | "inactive" | "deleted";
		password?: string;
	},
): Promise<any> => {
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
};

/**
 * @description Check if a user is an admin
 * @param id - The id of the user
 * @returns True if the user is an admin, false otherwise
 */
export const isUserAdmin = async (id: string): Promise<boolean> => {
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
};

/**
 * @description Check if a user has a specific role
 * @param id - The id of the user
 * @param targetRole - The target role to check
 * @returns True if the user has the target role, false otherwise
 */
export const checkUserRole = async (
	id: string,
	targetRole: "user" | "admin" | "service_provider" | "support",
): Promise<boolean> => {
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
};

/**
 * @description Get the role of a user
 * @param id - The id of the user
 * @returns The role of the user
 */
export const getUserRole = async (id: string): Promise<string | null> => {
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
};

/**
 * @description Get all active users
 * @returns All active users
 */
export const getActiveUsers = async (): Promise<Array<User>> => {
	try {
		return await db.select().from(user).where(eq(user.status, "active"));
	} catch (error) {
		console.error("Failed to get active users from database");
		throw error;
	}
};

/**
 * @description Get all users by role
 * @param role - The role to get users by
 * @returns All users with the specified role
 */
export const getUsersByRole = async (
	role: "user" | "admin" | "service_provider" | "support",
): Promise<Array<User>> => {
	try {
		return await db
			.select()
			.from(user)
			.where(and(eq(user.role, role), eq(user.status, "active")));
	} catch (error) {
		console.error("Failed to get users by role from database");
		throw error;
	}
};

/**
 * @description Soft delete a user
 * @param id - The id of the user
 * @returns The user
 */
export const softDeleteUser = async (id: string): Promise<any> => {
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
};
