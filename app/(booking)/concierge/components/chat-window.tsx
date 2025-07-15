"use client";

import { memo, useMemo } from "react";

import { useAgentStore } from "@/app/(booking)/store/ai-concierge-store";
import { ConciergeIcon } from "@/components/custom/icons";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { Message } from "./message";
import { TypingIndicator } from "./typing-indicator";
import { UI_CONFIG, CHAT_STATUS } from "../constants";
import { useAgentChat } from "../hooks/use-agent-chat";
import { ChatProps } from "../types";
import { isEmptyObject } from "../utils";

const ChatComponent = ({ conversationId }: ChatProps) => {
	const bookingInfo = useAgentStore((s) => s.bookingInfo);

	const {
		extendedMessages,
		input,
		setInput,
		handleSubmit,
		stop,
		append,
		status,
		messages,
		isTyping,
	} = useAgentChat({ conversationId });

	const showSuggestions = useMemo(
		() => extendedMessages.length === 0 && isEmptyObject(bookingInfo),
		[extendedMessages.length, bookingInfo],
	);

	const statusText = "Typically replies instantly";

	const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

	return (
		<div
			className={`flex h-full ${UI_CONFIG.CHAT_WINDOW_WIDTH} flex-col border-l border-border bg-card`}
		>
			{/* Header */}
			<div className="flex-none border-b border-border p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="flex size-7 items-center justify-center rounded-full bg-gray-700 font-bold text-white">
							<ConciergeIcon />
						</div>
						<h3 className="text-sm font-medium">Onelimo Concierge</h3>
					</div>
					<div className="flex items-center gap-1">
						<div className="mt-0.5 size-2 animate-pulse rounded-full bg-green-500" />
						<span className="text-xs text-muted-foreground">{statusText}</span>
					</div>
				</div>
			</div>

			{/* Chat suggestions */}
			{showSuggestions && (
				<div className="m-4 flex-none rounded-lg border border-border bg-background p-4">
					<div className="flex gap-1">
						<svg
							className="size-5 text-primary"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 16v-4" />
							<path d="M12 8h.01" />
						</svg>
						<p className="text-sm text-muted-foreground">
							I&apos;m your personal concierge for luxury car bookings. I&apos;ll help you arrange
							the perfect transportation for your needs. How can I assist you today?
						</p>
					</div>
				</div>
			)}

			{/* Chat messages */}
			<div className="flex min-h-0 flex-1 flex-col">
				<div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
					{extendedMessages.map((message) => (
						<Message
							key={message.id}
							role={message.role}
							content={message.content}
							toolCalls={message.toolCalls}
							timestamp={message.timestamp}
							messageStatus={status}
							isLastMessage={message.id === extendedMessages[extendedMessages.length - 1].id}
						/>
					))}

					{isTyping && <TypingIndicator />}

					<div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
				</div>

				{/* Message input */}
				<form className="flex-none border-t border-border p-4">
					<MultimodalInput
						input={input}
						setInput={setInput}
						handleSubmit={handleSubmit}
						isLoading={status === CHAT_STATUS.SUBMITTED || status === CHAT_STATUS.STREAMING}
						stop={stop}
						messages={messages}
						append={append}
					/>
				</form>
			</div>
		</div>
	);
};

export const Chat = memo(ChatComponent);
