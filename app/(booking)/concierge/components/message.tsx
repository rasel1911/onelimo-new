import { motion } from "framer-motion";
import { User } from "lucide-react";

import { ConciergeIcon } from "@/components/custom/icons";
import { Markdown } from "@/components/custom/markdown";

import { ToolIndicator } from "./tool-indicator";
import { MessageProps } from "../types";

export const Message = ({
	role,
	content,
	toolCalls,
	timestamp,
	messageStatus,
	isLastMessage,
}: MessageProps) => {
	const isUser = role === "user";

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
		>
			{/* Avatar */}
			<div
				className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
					isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
				}`}
			>
				{isUser ? <User className="size-4" /> : <ConciergeIcon />}
			</div>

			{/* Message content */}
			<div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
				<div
					className={`${isLastMessage && messageStatus !== "ready" && !isUser ? "" : "rounded-lg px-4 py-3"} ${
						isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
					}`}
				>
					<div className="text-sm">
						{isUser ? <div>{content}</div> : <Markdown>{content}</Markdown>}
					</div>
				</div>

				{/* Tool indicators */}
				{toolCalls && toolCalls.length > 0 && messageStatus !== "ready" && isLastMessage && (
					<div className="flex flex-col gap-2">
						{toolCalls.map((toolCall) => (
							<ToolIndicator
								key={toolCall.id}
								toolName={toolCall.name}
								status={toolCall.status}
								args={toolCall.args}
								result={toolCall.result}
							/>
						))}
					</div>
				)}

				{/* Timestamp */}
				<div className="text-xs text-muted-foreground">
					{new Date(timestamp).toLocaleTimeString("en-GB", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>
		</motion.div>
	);
};
