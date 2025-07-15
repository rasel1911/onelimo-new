import { desc, eq } from "drizzle-orm";

import db from "@/db/connection";

import { chat } from "../schema/chat.schema";

/**
 * Save a chat to the database
 * @param id - The id of the chat to save
 * @param messages - The messages to save
 * @param userId - The id of the user to save the chat for
 * @returns The saved chat
 */
export const saveChat = async ({
	id,
	messages,
	userId,
}: {
	id: string;
	messages: any;
	userId: string;
}) => {
	try {
		const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

		if (selectedChats.length > 0) {
			return await db
				.update(chat)
				.set({
					messages: JSON.stringify(messages),
				})
				.where(eq(chat.id, id));
		}

		return await db.insert(chat).values({
			id,
			createdAt: new Date(),
			messages: JSON.stringify(messages),
			userId,
		});
	} catch (error) {
		console.error("Failed to save chat in database");
		throw error;
	}
};

/**
 * Delete a chat by id
 * @param id - The id of the chat to delete
 * @returns The deleted chat
 */
export const deleteChatById = async ({ id }: { id: string }) => {
	try {
		return await db.delete(chat).where(eq(chat.id, id));
	} catch (error) {
		console.error("Failed to delete chat by id from database");
		throw error;
	}
};

/**
 * Get chats by user id
 * @param id - The id of the user to get chats for
 * @returns The chats
 */
export const getChatsByUserId = async ({ id }: { id: string }) => {
	try {
		return await db.select().from(chat).where(eq(chat.userId, id)).orderBy(desc(chat.createdAt));
	} catch (error) {
		console.error("Failed to get chats by user from database");
		throw error;
	}
};

/**
 * Get a chat by id
 * @param id - The id of the chat to get
 * @returns The chat
 */
export const getChatById = async ({ id }: { id: string }) => {
	try {
		const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
		return selectedChat;
	} catch (error) {
		console.error("Failed to get chat by id from database");
		throw error;
	}
};
