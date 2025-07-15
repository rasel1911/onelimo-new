import { StateCreator } from "zustand";

import { Conversation, Message } from "@/app/(booking)/concierge/types";

export interface ConversationSlice {
	conversations: Record<string, Conversation>;
	currentConversationId?: string;

	addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => void;
	updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
	createConversation: (id: string) => void;
	setCurrentConversation: (id: string) => void;
	clearConversation: (id: string) => void;
}

export const createConversationSlice: StateCreator<ConversationSlice, [], [], ConversationSlice> = (
	set,
	get,
) => ({
	conversations: {},

	addMessage: (conversationId, message) =>
		set((state) => {
			const convo = state.conversations[conversationId];
			if (!convo) return state;

			const newMessage: Message = {
				...message,
				id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				timestamp: Date.now(),
			};

			return {
				conversations: {
					...state.conversations,
					[conversationId]: {
						...convo,
						messages: [...convo.messages, newMessage],
					},
				},
			} as any;
		}),

	updateMessage: (conversationId, messageId, updates) =>
		set((state) => {
			const convo = state.conversations[conversationId];
			if (!convo) return state;

			return {
				conversations: {
					...state.conversations,
					[conversationId]: {
						...convo,
						messages: convo.messages.map((msg) =>
							msg.id === messageId ? { ...msg, ...updates } : msg,
						),
					},
				},
			} as any;
		}),

	createConversation: (id) =>
		set((state) => ({
			conversations: {
				...state.conversations,
				[id]: {
					id,
					messages: [],
				},
			},
			currentConversationId: id,
		})),

	setCurrentConversation: (id) => set({ currentConversationId: id }),

	clearConversation: (id) =>
		set((state) => {
			const convo = state.conversations[id];
			if (!convo) return state;

			return {
				conversations: {
					...state.conversations,
					[id]: { ...convo, messages: [] },
				},
			} as any;
		}),
});
