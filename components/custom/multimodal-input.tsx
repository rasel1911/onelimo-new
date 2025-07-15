import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import React, { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { ArrowUpIcon, StopIcon } from "./icons";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const suggestedActions = [
	{
		title: "Need help with your booking?",
		label: "Get assistance with vehicle options and pricing",
		action: "I need help with my booking. Can you assist with vehicle options and pricing?",
	},
	{
		title: "Looking for a specific vehicle?",
		label: "Explore our luxury sedans, SUVs, and specialty vehicles",
		action: "Can you tell me about the different vehicle types available?",
	},
];

export const MultimodalInput = ({
	input,
	setInput,
	isLoading,
	stop,
	messages,
	handleSubmit,
	append,
}: {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	stop: () => void;
	messages: Array<Message>;
	append: (
		message: Message | CreateMessage,
		chatRequestOptions?: ChatRequestOptions,
	) => Promise<string | null | undefined>;
	handleSubmit: (
		event?: {
			preventDefault?: () => void;
		},
		chatRequestOptions?: ChatRequestOptions,
	) => void;
}) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { width } = useWindowSize();

	useEffect(() => {
		if (textareaRef.current) {
			adjustHeight();
		}
	}, []);

	const adjustHeight = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 0}px`;
		}
	};

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
		adjustHeight();
	};

	const submitForm = useCallback(() => {
		handleSubmit(undefined, {});
		if (width && width > 768) {
			textareaRef.current?.focus();
		}
	}, [width, handleSubmit]);

	return (
		<div className="relative flex w-full flex-col gap-4">
			{messages.length === 0 && (
				<div className="mx-auto grid w-full gap-4 sm:grid-cols-2 md:max-w-[500px] md:px-0">
					{suggestedActions.map((suggestedAction, index) => (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{ delay: 0.05 * index }}
							key={index}
							className={index > 1 ? "hidden sm:block" : "block"}
						>
							<button
								onClick={async () => {
									append({
										role: "user",
										content: suggestedAction.action,
									});
								}}
								className="flex w-full flex-col rounded-lg border border-none border-zinc-200 bg-muted/50 p-3 text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
							>
								<span className="font-medium">{suggestedAction.title}</span>
								<span className="text-zinc-500 dark:text-zinc-400">{suggestedAction.label}</span>
							</button>
						</motion.div>
					))}
				</div>
			)}

			<Textarea
				ref={textareaRef}
				placeholder="Send a message..."
				value={input}
				onChange={handleInput}
				className="min-h-[24px] resize-none overflow-hidden rounded-lg border-none bg-muted text-base"
				rows={3}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();

						if (isLoading) {
							toast.error("Please wait for until our Concierge is done processing your request.");
						} else {
							submitForm();
						}
					}
				}}
			/>

			{isLoading ? (
				<Button
					className="absolute bottom-2 right-2 m-0.5 h-fit rounded-full p-1.5 text-white"
					onClick={(event) => {
						event.preventDefault();
						stop();
					}}
				>
					<StopIcon size={14} />
				</Button>
			) : (
				<Button
					className="absolute bottom-2 right-2 m-0.5 h-fit rounded-full p-1.5 text-white"
					onClick={(event) => {
						event.preventDefault();
						submitForm();
					}}
					disabled={input.length === 0}
				>
					<ArrowUpIcon size={14} />
				</Button>
			)}
		</div>
	);
};
