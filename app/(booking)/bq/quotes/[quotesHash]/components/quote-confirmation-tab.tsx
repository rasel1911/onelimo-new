import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ActionType = "confirm" | "question";

interface MessageConfig {
	type: ActionType;
	label: string;
	placeholder: string;
	buttonText: string;
	successTitle: string;
	successDescription: string;
	errorTitle: string;
	defaultMessage: string;
	enhancedSuffix: string;
}

export const MESSAGE_CONFIGS: Record<ActionType, MessageConfig> = {
	confirm: {
		type: "confirm",
		label: "Confirmation Message *",
		placeholder: "Write your confirmation message...",
		buttonText: "Confirm Booking",
		successTitle: "Selection Confirmed!",
		successDescription: "has been confirmed.",
		errorTitle: "Confirmation Failed",
		defaultMessage:
			"Thank you for your quote! I'd like to confirm booking with {providerName} for £{amount}. Looking forward to the ride!",
		enhancedSuffix:
			"\n\nThank you for the professional service and quick response time. I appreciate your attention to detail and look forward to a comfortable ride experience.",
	},
	question: {
		type: "question",
		label: "Your Question *",
		placeholder: "What would you like to ask about this quote?",
		buttonText: "Send Question",
		successTitle: "Question Sent!",
		successDescription: "They will respond shortly.",
		errorTitle: "Failed to Send Question",
		defaultMessage:
			"Hi {providerName}, I have a few questions about your quote before confirming. Could you please provide more details about the service?",
		enhancedSuffix:
			"\n\nI'd appreciate your prompt response so I can make an informed decision. Thank you for your time and consideration.",
	},
};

export const QuoteConfirmationTab = ({
	type,
	messages,
	submitting,
	updateMessage,
	handleWriteWithAI,
	handleEnhanceMessage,
	handleSubmitAction,
}: {
	type: ActionType;
	messages: Record<ActionType, string>;
	submitting: boolean;
	updateMessage: (type: ActionType, value: string) => void;
	handleWriteWithAI: (type: ActionType) => Promise<void>;
	handleEnhanceMessage: (type: ActionType) => Promise<void>;
	handleSubmitAction: (type: ActionType) => Promise<void>;
}) => {
	const config = MESSAGE_CONFIGS[type];
	const currentMessage = messages[type];

	return (
		<TabsContent value={type} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor={`${type}-message`}>{config.label}</Label>
				<Textarea
					id={`${type}-message`}
					placeholder={config.placeholder}
					value={currentMessage}
					onChange={(e) => updateMessage(type, e.target.value)}
					rows={4}
					className="resize-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/80"
				/>
			</div>

			<div className="flex gap-2">
				{!currentMessage.trim() ? (
					<Button
						onClick={() => handleWriteWithAI(type)}
						disabled={submitting}
						variant="outline"
						className="flex-1"
					>
						{submitting ? (
							<Loader2 className="mr-2 size-4 animate-spin" />
						) : (
							<Sparkles className="mr-2 size-4" />
						)}
						{submitting ? "Writing..." : "Help me write"}
					</Button>
				) : (
					<Button
						onClick={() => handleEnhanceMessage(type)}
						disabled={submitting}
						variant="outline"
						className="flex-1"
					>
						{submitting ? (
							<Loader2 className="mr-2 size-4 animate-spin" />
						) : (
							<Wand2 className="mr-2 size-4" />
						)}
						{submitting ? "Enhancing..." : "Enhance Message"}
					</Button>
				)}

				<Button
					onClick={() => handleSubmitAction(type)}
					disabled={submitting || !currentMessage.trim()}
					className="flex-1"
				>
					{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
					{submitting ? `${type === "confirm" ? "Confirming" : "Sending"}...` : config.buttonText}
				</Button>
			</div>
		</TabsContent>
	);
};
