import { eq, desc } from "drizzle-orm";

import db from "@/db/connection";
import { persistentRegistrationLink, PersistentRegistrationLink } from "@/db/schema";

/**
 * Generate a short, URL-friendly link identifier
 */
export const generateLinkId = (): string => {
	const random = Math.random().toString(36).substring(2, 10);
	const timestamp = Date.now().toString(36);
	return (random + timestamp).substring(0, 12);
};

/**
 * Create a new persistent registration link
 */
export const createPersistentLink = async (
	title: string,
	description?: string,
): Promise<PersistentRegistrationLink> => {
	let linkId = generateLinkId();
	let attempts = 0;
	const maxAttempts = 10;

	while (attempts < maxAttempts) {
		try {
			const result = await db
				.insert(persistentRegistrationLink)
				.values({
					linkId,
					title,
					description,
					isActive: true,
					usageCount: 0,
				})
				.returning();

			return result[0];
		} catch (error: any) {
			if (error.code === "23505" && attempts < maxAttempts - 1) {
				linkId = generateLinkId();
				attempts++;
				continue;
			}
			throw error;
		}
	}

	throw new Error("Failed to generate unique link ID after maximum attempts");
};

/**
 * Get all persistent registration links
 */
export const getPersistentLinks = async (): Promise<PersistentRegistrationLink[]> => {
	return await db
		.select()
		.from(persistentRegistrationLink)
		.orderBy(desc(persistentRegistrationLink.createdAt));
};

/**
 * Get a persistent link by linkId
 */
export const getPersistentLinkByLinkId = async (
	linkId: string,
): Promise<PersistentRegistrationLink | null> => {
	const result = await db
		.select()
		.from(persistentRegistrationLink)
		.where(eq(persistentRegistrationLink.linkId, linkId))
		.limit(1);

	return result[0] || null;
};

/**
 * Validate a persistent link (check if it exists and is active)
 */
export const validatePersistentLink = async (
	linkId: string,
): Promise<{
	isValid: boolean;
	link?: PersistentRegistrationLink;
	reason?: string;
}> => {
	const link = await getPersistentLinkByLinkId(linkId);

	if (!link) {
		return {
			isValid: false,
			reason: "Link not found",
		};
	}

	if (!link.isActive) {
		return {
			isValid: false,
			link,
			reason: "Link is inactive",
		};
	}

	return {
		isValid: true,
		link,
	};
};

/**
 * Increment usage count for a persistent link
 */
export const incrementLinkUsage = async (linkId: string): Promise<void> => {
	const currentLink = await getPersistentLinkByLinkId(linkId);
	if (!currentLink) return;

	await db
		.update(persistentRegistrationLink)
		.set({
			usageCount: currentLink.usageCount + 1,
			updatedAt: new Date(),
		})
		.where(eq(persistentRegistrationLink.linkId, linkId));
};

/**
 * Toggle active status of a persistent link
 */
export const togglePersistentLinkStatus = async (
	id: string,
	isActive: boolean,
): Promise<PersistentRegistrationLink | null> => {
	const result = await db
		.update(persistentRegistrationLink)
		.set({
			isActive,
			updatedAt: new Date(),
		})
		.where(eq(persistentRegistrationLink.id, id))
		.returning();

	return result[0] || null;
};

/**
 * Update persistent link details
 */
export const updatePersistentLink = async (
	id: string,
	updates: Partial<Pick<PersistentRegistrationLink, "title" | "description">>,
): Promise<PersistentRegistrationLink | null> => {
	const result = await db
		.update(persistentRegistrationLink)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(persistentRegistrationLink.id, id))
		.returning();

	return result[0] || null;
};

/**
 * Delete a persistent link
 */
export const deletePersistentLink = async (id: string): Promise<boolean> => {
	const result = await db
		.delete(persistentRegistrationLink)
		.where(eq(persistentRegistrationLink.id, id));

	return result.rowCount > 0;
};
