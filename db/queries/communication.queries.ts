import { desc, eq } from "drizzle-orm";

import db from "@/db/connection";

import { Communication, communication } from "../schema/communication.schema";

/**
 * Get all communications
 * @returns All communications
 */
export const getAllCommunications = async (): Promise<Array<Communication>> => {
	try {
		return await db.select().from(communication).orderBy(desc(communication.createdAt));
	} catch (error) {
		console.error("Failed to get communications from database");
		throw error;
	}
};

/**
 * Get a communication by id
 * @param id - The id of the communication to get
 * @returns The communication
 */
export const getCommunicationById = async (id: string): Promise<Communication | undefined> => {
	try {
		const [comm] = await db.select().from(communication).where(eq(communication.id, id));

		return comm;
	} catch (error) {
		console.error("Failed to get communication by id from database");
		throw error;
	}
};

/**
 * Get communications by service provider id
 * @param serviceProviderId - The id of the service provider to get communications for
 * @returns The communications
 */
export const getCommunicationsByServiceProvider = async (
	serviceProviderId: string,
): Promise<Array<Communication>> => {
	try {
		return await db
			.select()
			.from(communication)
			.where(eq(communication.serviceProviderId, serviceProviderId))
			.orderBy(desc(communication.createdAt));
	} catch (error) {
		console.error("Failed to get communications by service provider from database");
		throw error;
	}
};

/**
 * Create a communication
 * @param data - The data to create the communication with
 * @returns The created communication
 */
export const createCommunication = async (
	data: Omit<Communication, "id" | "createdAt" | "updatedAt">,
) => {
	try {
		const now = new Date();
		return await db.insert(communication).values({
			...data,
			createdAt: now,
			updatedAt: now,
		});
	} catch (error) {
		console.error("Failed to create communication in database");
		throw error;
	}
};

/**
 * Update a communication
 * @param id - The id of the communication to update
 * @param data - The data to update the communication with
 * @returns The updated communication
 */
export const updateCommunication = async (
	id: string,
	data: Partial<Omit<Communication, "id" | "createdAt" | "updatedAt">>,
) => {
	try {
		return await db
			.update(communication)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(communication.id, id));
	} catch (error) {
		console.error("Failed to update communication in database");
		throw error;
	}
};

/**
 * Update the progress of a communication
 * @param id - The id of the communication to update the progress of
 * @param progress - The new progress
 * @returns The updated communication
 */
export const updateCommunicationProgress = async (id: string, progress: number) => {
	try {
		return await db
			.update(communication)
			.set({
				progress,
				updatedAt: new Date(),
			})
			.where(eq(communication.id, id));
	} catch (error) {
		console.error("Failed to update communication progress in database");
		throw error;
	}
};

/**
 * Delete a communication
 * @param id - The id of the communication to delete
 * @returns The deleted communication
 */
export const deleteCommunication = async (id: string) => {
	try {
		return await db.delete(communication).where(eq(communication.id, id));
	} catch (error) {
		console.error("Failed to delete communication from database");
		throw error;
	}
};
