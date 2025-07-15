import { eq } from "drizzle-orm";

import db from "@/db/connection";

import { serviceProvider as serviceProviderTable } from "../schema/serviceProvider.schema";
import { type ServiceProvider } from "../schema/serviceProvider.schema";

/**
 * Get all service providers
 * @returns {Promise<ServiceProvider[]>}
 */
export const getAllServiceProviders = async (): Promise<ServiceProvider[]> => {
	return await db.select().from(serviceProviderTable);
};

/**
 * Get a service provider by ID
 * @param {string} id - The ID of the service provider
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const getServiceProviderById = async (id: string): Promise<ServiceProvider | undefined> => {
	const results = await db
		.select()
		.from(serviceProviderTable)
		.where(eq(serviceProviderTable.id, id));

	return results[0];
};

/**
 * Get a service provider by email
 * @param {string} email - The email of the service provider
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const getServiceProviderByEmail = async (
	email: string,
): Promise<ServiceProvider | undefined> => {
	const results = await db
		.select()
		.from(serviceProviderTable)
		.where(eq(serviceProviderTable.email, email));

	return results[0];
};

/**
 * Get a service provider by reset token
 * @param {string} token - The reset token
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const getServiceProviderByResetToken = async (
	token: string,
): Promise<ServiceProvider | undefined> => {
	const results = await db
		.select()
		.from(serviceProviderTable)
		.where(eq(serviceProviderTable.pinResetToken, token));

	return results[0];
};

/**
 * Create a service provider
 * @param {Omit<ServiceProvider, "id" | "createdAt" | "updatedAt">} data - The data for the service provider
 * @returns {Promise<ServiceProvider>}
 */
export const createServiceProvider = async (
	data: Omit<ServiceProvider, "id" | "createdAt" | "updatedAt">,
): Promise<ServiceProvider> => {
	const result = await db
		.insert(serviceProviderTable)
		.values({
			...data,
		})
		.returning();

	return result[0];
};

/**
 * Update a service provider
 * @param {string} id - The ID of the service provider
 * @param {Partial<Omit<ServiceProvider, "id" | "createdAt" | "updatedAt">>} data - The data to update
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const updateServiceProvider = async (
	id: string,
	data: Partial<Omit<ServiceProvider, "id" | "createdAt" | "updatedAt">>,
): Promise<ServiceProvider | undefined> => {
	const result = await db
		.update(serviceProviderTable)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Update a service provider's PIN
 * @param {string} id - The ID of the service provider
 * @param {string} pinHash - The hashed PIN
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const updateServiceProviderPin = async (
	id: string,
	pinHash: string,
): Promise<ServiceProvider | undefined> => {
	const result = await db
		.update(serviceProviderTable)
		.set({
			pinHash,
			pinSalt: null, // bcrypt includes salt in hash, so we don't need separate salt
			pinSetAt: new Date(),
			failedPinAttempts: 0,
			isBlocked: "false",
			blockedAt: null,
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Increment the failed PIN attempts for a service provider
 * @param {string} id - The ID of the service provider
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const incrementFailedPinAttempts = async (
	id: string,
): Promise<ServiceProvider | undefined> => {
	const provider = await getServiceProviderById(id);
	if (!provider) return undefined;

	const newAttempts = (provider.failedPinAttempts || 0) + 1;
	const shouldBlock = newAttempts >= 3;

	const result = await db
		.update(serviceProviderTable)
		.set({
			failedPinAttempts: newAttempts,
			lastFailedPinAttempt: new Date(),
			...(shouldBlock && {
				isBlocked: "true",
				blockedAt: new Date(),
			}),
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Reset the failed PIN attempts for a service provider
 * @param {string} id - The ID of the service provider
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const resetFailedPinAttempts = async (id: string): Promise<ServiceProvider | undefined> => {
	const result = await db
		.update(serviceProviderTable)
		.set({
			failedPinAttempts: 0,
			lastFailedPinAttempt: null,
			isBlocked: "false",
			blockedAt: null,
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Create a PIN reset token for a service provider
 * @param {string} id - The ID of the service provider
 * @param {string} token - The token to use for the reset
 * @param {Date} expiresAt - The expiration date for the token
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const createPinResetToken = async (
	id: string,
	token: string,
	expiresAt: Date,
): Promise<ServiceProvider | undefined> => {
	const result = await db
		.update(serviceProviderTable)
		.set({
			pinResetToken: token,
			pinResetTokenExpiresAt: expiresAt,
			pinResetRequestedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Clear the PIN reset token for a service provider
 * @param {string} id - The ID of the service provider
 * @returns {Promise<ServiceProvider | undefined>}
 */
export const clearPinResetToken = async (id: string): Promise<ServiceProvider | undefined> => {
	const result = await db
		.update(serviceProviderTable)
		.set({
			pinResetToken: null,
			pinResetTokenExpiresAt: null,
			pinResetRequestedAt: null,
			updatedAt: new Date(),
		})
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result[0];
};

/**
 * Delete a service provider
 * @param {string} id - The ID of the service provider
 * @returns {Promise<boolean>}
 */
export const deleteServiceProvider = async (id: string): Promise<boolean> => {
	const result = await db
		.delete(serviceProviderTable)
		.where(eq(serviceProviderTable.id, id))
		.returning();

	return result.length > 0;
};
