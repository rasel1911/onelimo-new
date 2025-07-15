import { useCallback } from "react";

import { useAgentStore } from "@/app/(booking)/store/ai-concierge-store";

import { APP_CONFIG, TOOL_NAMES } from "../constants";
import { ToolCall, UseToolHandlerOptions } from "../types";

/**
 * @description
 * Handles tool calls for the booking agent
 */
export const useToolHandler = ({
	conversationId,
	onToolCallUpdate,
	onToolCallComplete,
	onClearMessages,
}: UseToolHandlerOptions) => {
	const {
		updateBookingInfo,
		resetBookingInfo,
		setBookingConfirmed,
		clearConversation,
		setCurrentToolCall,
	} = useAgentStore();

	const handleToolCall = useCallback(
		async ({ id, name, args }: ToolCall) => {
			console.log(`🔧 Handling tool call: ${name}`, args);

			setCurrentToolCall({ id, name, args });

			onToolCallUpdate({
				id,
				name,
				args,
				status: "pending",
			});

			try {
				switch (name) {
					case TOOL_NAMES.UPDATE_BOOKING_SESSION:
						updateBookingInfo(args);
						break;

					case TOOL_NAMES.CONFIRM_BOOKING:
						if (args.customerConfirmation) {
							setBookingConfirmed(true);
						}
						break;

					case TOOL_NAMES.RESET_BOOKING_SESSION:
						if (args.confirmReset) {
							resetBookingInfo();
							clearConversation(conversationId);
							onClearMessages();
						}
						break;
				}

				if (name !== TOOL_NAMES.UPDATE_BOOKING_SESSION) {
					setTimeout(() => {
						onToolCallComplete(id);
					}, APP_CONFIG.TOOL_COMPLETION_DELAY);
				}
			} catch (error) {
				console.error(`Tool call error for ${name}:`, error);

				onToolCallUpdate({
					id,
					name,
					args,
					status: "error",
				});
			}
		},
		[
			conversationId,
			updateBookingInfo,
			setBookingConfirmed,
			resetBookingInfo,
			clearConversation,
			setCurrentToolCall,
			onToolCallUpdate,
			onToolCallComplete,
			onClearMessages,
		],
	);

	return { handleToolCall };
};
