import { useEffect, useRef, useState, useCallback } from "react";

import { useAgentStore } from "../../store/ai-concierge-store";
import { ExtendedMessage, UseConversationManagerOptions } from "../types";
import { isEmptyObject } from "../utils";

/**
 * @description
 * Manages the conversation for the booking agent
 * @param conversationId - The ID of the conversation
 */
export const useConversationManager = ({ conversationId }: UseConversationManagerOptions) => {
	const conversationInitialized = useRef<string | null>(null);
	const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);

	const { conversations, addMessage, createConversation, setCurrentConversation, bookingInfo } =
		useAgentStore();

	useEffect(() => {
		if (conversationInitialized.current === conversationId) return;

		const existingConversations = useAgentStore.getState().conversations;
		if (!existingConversations[conversationId]) {
			createConversation(conversationId);
		} else {
			setCurrentConversation(conversationId);
		}

		conversationInitialized.current = conversationId;
		setInitialMessagesLoaded(true);
	}, [conversationId, createConversation, setCurrentConversation]);

	const getInitialMessages = useCallback((): ExtendedMessage[] => {
		const currentConversation = conversations[conversationId];
		if (!currentConversation || !initialMessagesLoaded) return [];

		return currentConversation.messages.map((m: ExtendedMessage) => ({
			id: m.id,
			role: m.role,
			content: m.content,
			timestamp: m.timestamp,
			toolCalls: m.toolCalls || [],
		}));
	}, [conversations, conversationId, initialMessagesLoaded]);

	const persistMessage = useCallback(
		(message: { role: "user" | "assistant"; content: string }) => {
			addMessage(conversationId, message);
		},
		[conversationId, addMessage],
	);

	const generateWelcomeMessage = useCallback((): ExtendedMessage | null => {
		if (!initialMessagesLoaded) return null;
		if (isEmptyObject(bookingInfo)) return null;

		return {
			id: "welcome-back",
			role: "assistant",
			content:
				"Welcome back! I can see you have some booking information saved. Would you like to continue with your current booking or start a new one?",
			timestamp: Date.now(),
		};
	}, [initialMessagesLoaded, bookingInfo]);

	return {
		initialMessagesLoaded,
		getInitialMessages,
		persistMessage,
		generateWelcomeMessage,
	};
};
