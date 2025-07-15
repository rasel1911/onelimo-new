import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo } from "react";

import { APP_CONFIG, CHAT_STATUS } from "../constants";
import { UseAgentChatOptions } from "../types";
import { useConversationManager } from "./use-conversation-manager";
import { useMessageManager } from "./use-message-manager";
import { useToolHandler } from "./use-tool-handler";
import { useAgentStore } from "../../store/ai-concierge-store";

/**
 * @description
 * Manages the chat for the booking agent
 * @param conversationId - The ID of the conversation
 */
export const useAgentChat = ({ conversationId }: UseAgentChatOptions) => {
	const {
		bookingInfo,
		setProcessing,
		setCurrentToolCall,
		isProcessing,
		currentToolCall,
		userData,
	} = useAgentStore();

	const { getInitialMessages, persistMessage, generateWelcomeMessage } = useConversationManager({
		conversationId,
	});

	const initialMessages = useMemo(() => getInitialMessages(), [getInitialMessages]);
	const {
		extendedMessages,
		addMessage,
		replaceEmptyMessage,
		updateToolCall,
		updateToolCallStatus,
		userMessageExists,
		clearMessages,
	} = useMessageManager({ conversationId, initialMessages });

	const { handleToolCall } = useToolHandler({
		conversationId,
		onToolCallUpdate: updateToolCall,
		onToolCallComplete: (toolCallId: string) => updateToolCallStatus(toolCallId, "completed"),
		onClearMessages: clearMessages,
	});

	const { messages, handleSubmit, input, setInput, append, stop, status } = useChat({
		api: APP_CONFIG.CHAT_API_ENDPOINT,
		initialMessages: initialMessages.map((m) => ({
			id: m.id,
			role: m.role,
			content: m.content,
		})),
		body: {
			bookingContext: bookingInfo,
			userName: userData.name || undefined,
			userData: userData,
		},
		onFinish: (message) => {
			replaceEmptyMessage(message.content);
			persistMessage({ role: "assistant", content: message.content });
			setProcessing(false);
			setCurrentToolCall(undefined);
		},
		onToolCall: async ({ toolCall }) => {
			const { toolCallId, toolName, args } = toolCall;
			await handleToolCall({ id: toolCallId, name: toolName, args, status: "pending" });
			return undefined;
		},
	});

	// Sync user messages to extended messages and persistence
	useEffect(() => {
		if (messages.length === 0) return;
		const lastMessage = messages[messages.length - 1];
		if (lastMessage.role !== "user") return;

		if (userMessageExists(lastMessage.content)) return;

		addMessage({
			role: "user",
			content: lastMessage.content,
		});
		persistMessage({ role: "user", content: lastMessage.content });
	}, [messages, addMessage, persistMessage, userMessageExists]);

	// Handle message for existing bookings
	useEffect(() => {
		if (extendedMessages.length > 0) return;

		const welcomeMessage = generateWelcomeMessage();
		if (welcomeMessage) {
			addMessage(welcomeMessage);
			persistMessage({ role: "assistant", content: welcomeMessage.content });
		}
	}, [extendedMessages.length, generateWelcomeMessage, addMessage, persistMessage]);

	const isTyping = useMemo(() => {
		const lastMessage = extendedMessages[extendedMessages.length - 1];
		const hasToolCalls = Boolean(lastMessage?.toolCalls?.length);

		if (status === CHAT_STATUS.SUBMITTED && messages[messages.length - 1]?.role === "user") {
			return !hasToolCalls;
		}
		if (status === CHAT_STATUS.STREAMING) return !hasToolCalls;
		if (isProcessing || currentToolCall) return hasToolCalls;
		return false;
	}, [status, extendedMessages, messages, isProcessing, currentToolCall]);

	return {
		extendedMessages,
		input,
		setInput,
		handleSubmit,
		stop,
		append,
		status,
		messages,
		isTyping,
		clearMessages,
	} as const;
};
