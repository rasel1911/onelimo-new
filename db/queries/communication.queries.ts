import { desc, eq } from "drizzle-orm";

import { db } from "../connection";
import { Communication, communication } from "../schema/communication.schema";

export async function getAllCommunications(): Promise<Array<Communication>> {
  try {
    return await db
      .select()
      .from(communication)
      .orderBy(desc(communication.createdAt));
  } catch (error) {
    console.error("Failed to get communications from database");
    throw error;
  }
}

export async function getCommunicationById(id: string): Promise<Communication | undefined> {
  try {
    const [comm] = await db
      .select()
      .from(communication)
      .where(eq(communication.id, id));
    
    return comm;
  } catch (error) {
    console.error("Failed to get communication by id from database");
    throw error;
  }
}

export async function getCommunicationsByServiceProvider(serviceProviderId: string): Promise<Array<Communication>> {
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
}

export async function createCommunication(data: Omit<Communication, "id" | "createdAt" | "updatedAt">) {
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
}

export async function updateCommunication(
  id: string,
  data: Partial<Omit<Communication, "id" | "createdAt" | "updatedAt">>
) {
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
}

export async function updateCommunicationProgress(id: string, progress: number) {
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
}

export async function deleteCommunication(id: string) {
  try {
    return await db.delete(communication).where(eq(communication.id, id));
  } catch (error) {
    console.error("Failed to delete communication from database");
    throw error;
  }
} 