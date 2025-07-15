import { useCallback, useEffect, useState } from "react";

import { APP_CONFIG } from "../constants";
import { ExtendedMessage, UseMessageManagerOptions } from "../types";
import { generateMessageId } from "../utils";

/**
 * @description
 * Manages messages for the booking agent
 * @param conversationId - The ID of the conversation
 * @param initialMessages - The initial messages
 */
export const useMessageManager = ({
	conversationId,
	initialMessages,
}: UseMessageManagerOptions) => {
	const [extendedMessages, setExtendedMessages] = useState<ExtendedMessage[]>(initialMessages);

	const addMessage = useCallback((message: Omit<ExtendedMessage, "id" | "timestamp">) => {
		const newMessage: ExtendedMessage = {
			...message,
			id: generateMessageId(),
			timestamp: Date.now(),
		};

		setExtendedMessages((prev) => [...prev, newMessage]);
		return newMessage;
	}, []);

	const updateMessage = useCallback((messageId: string, updates: Partial<ExtendedMessage>) => {
		setExtendedMessages((prev) =>
			prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
		);
	}, []);

	const replaceEmptyMessage = useCallback((content: string) => {
		setExtendedMessages((prev) => {
			const updated = prev.map((msg) =>
				msg.role === "assistant" && msg.content === "" ? { ...msg, content } : msg,
			);

			// If no empty message was found, add a new one
			if (!updated.some((msg) => msg.role === "assistant" && msg.content === content)) {
				updated.push({
					id: generateMessageId(),
					role: "assistant",
					content,
					timestamp: Date.now(),
					toolCalls: [],
				});
			}

			return updated;
		});
	}, []);

	// Add or update tool call in the last assistant message
	const updateToolCall = useCallback((toolCall: NonNullable<ExtendedMessage["toolCalls"]>[0]) => {
		setExtendedMessages((prev) => {
			const lastMessage = prev[prev.length - 1];

			if (lastMessage && lastMessage.role === "assistant" && lastMessage.content === "") {
				return prev.map((msg, idx) =>
					idx === prev.length - 1
						? {
								...msg,
								toolCalls: mergeToolCalls(msg.toolCalls, toolCall),
							}
						: msg,
				);
			}

			return [
				...prev,
				{
					id: generateMessageId(),
					role: "assistant",
					content: "",
					timestamp: Date.now(),
					toolCalls: [toolCall],
				},
			];
		});
	}, []);

	const updateToolCallStatus = useCallback(
		(toolCallId: string, status: "pending" | "completed" | "error") => {
			setExtendedMessages((prev) =>
				prev.map((msg) =>
					msg.toolCalls
						? {
								...msg,
								toolCalls: msg.toolCalls.map((tc) =>
									tc.id === toolCallId && tc.status === "pending" ? { ...tc, status } : tc,
								),
							}
						: msg,
				),
			);
		},
		[],
	);

	// Check if user message already exists
	const userMessageExists = useCallback(
		(content: string, timeThreshold = APP_CONFIG.MESSAGE_DUPLICATE_THRESHOLD) => {
			return extendedMessages.some(
				(msg) =>
					msg.role === "user" &&
					msg.content === content &&
					Date.now() - msg.timestamp < timeThreshold,
			);
		},
		[extendedMessages],
	);

	const clearMessages = useCallback(() => {
		setExtendedMessages([]);
	}, []);

	const resetMessages = useCallback(() => {
		setExtendedMessages(initialMessages);
	}, [initialMessages]);

	return {
		extendedMessages,
		addMessage,
		updateMessage,
		replaceEmptyMessage,
		updateToolCall,
		updateToolCallStatus,
		userMessageExists,
		clearMessages,
		resetMessages,
	};
};

/**
 * @description
 * Merges tool calls into the existing tool calls
 * @param existing - The existing tool calls
 * @param newCall - The new tool call
 * @returns The merged tool calls
 */
const mergeToolCalls = (
	existing: ExtendedMessage["toolCalls"] = [],
	newCall: NonNullable<ExtendedMessage["toolCalls"]>[0],
) => {
	const arr = [...existing];
	const idx = arr.findIndex((tc) => tc.id === newCall.id);

	if (idx >= 0) {
		arr[idx] = newCall;
	} else {
		arr.push(newCall);
	}

	return arr;
};
