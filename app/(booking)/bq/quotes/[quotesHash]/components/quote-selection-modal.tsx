"use client";

import { MessageSquare, Check } from "lucide-react";
import { useState } from "react";

import {
	QuoteConfirmationTab,
	MESSAGE_CONFIGS,
} from "@/app/(booking)/bq/quotes/[quotesHash]/components/quote-confirmation-tab";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { toast } from "@/hooks/use-toast";

type ActionType = "confirm" | "question";

interface QuoteSelectionModalProps {
	quote: WorkflowQuote | null;
	isOpen: boolean;
	onClose: () => void;
	onConfirm?: () => void;
	quotesHash: string;
}

export const QuoteSelectionModal = ({
	quote,
	isOpen,
	onClose,
	onConfirm,
	quotesHash,
}: QuoteSelectionModalProps) => {
	const [messages, setMessages] = useState<Record<ActionType, string>>({
		confirm: "",
		question: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<ActionType>("confirm");

	const generateMessage = (template: string, quote: WorkflowQuote | null): string => {
		if (!quote) return template;

		return template
			.replace("{providerName}", quote.providerName)
			.replace("{amount}", quote.amount ? quote.amount.toFixed(2) : "TBD");
	};

	const handleWriteWithAI = async (type: ActionType) => {
		if (!quote) return;

		setSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const config = MESSAGE_CONFIGS[type];
		const generatedMessage = generateMessage(config.defaultMessage, quote);

		setMessages((prev) => ({ ...prev, [type]: generatedMessage }));
		setSubmitting(false);
	};

	const handleEnhanceMessage = async (type: ActionType) => {
		const currentMessage = messages[type];
		if (!currentMessage.trim()) return;

		setSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const config = MESSAGE_CONFIGS[type];
		const enhanced = `${currentMessage}${config.enhancedSuffix}`;

		setMessages((prev) => ({ ...prev, [type]: enhanced }));
		setSubmitting(false);
	};

	const handleSubmitAction = async (type: ActionType) => {
		const currentMessage = messages[type];
		if (!quote || !currentMessage.trim()) {
			toast({
				title: "Missing Information",
				description: `Please provide ${type === "confirm" ? "a confirmation message" : "your question"}.`,
				variant: "destructive",
			});
			return;
		}

		try {
			setSubmitting(true);
			const response = await fetch(`/api/bq/quotes/${quotesHash}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quoteId: quote.quoteId,
					providerId: quote.providerId,
					message: currentMessage.trim(),
					action: type,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Failed to ${type} selection`);
			}

			const config = MESSAGE_CONFIGS[type];

			toast({
				title: config.successTitle,
				description: `${type === "confirm" ? `Your quote from ${quote.providerName} ` : `Your question has been sent to ${quote.providerName}. `}${config.successDescription}`,
			});

			onClose();
			setMessages({ confirm: "", question: "" });

			if (type === "confirm" && onConfirm) {
				onConfirm();
			}
		} catch (error) {
			console.error(`Error ${type}ing selection:`, error);
			const config = MESSAGE_CONFIGS[type];
			toast({
				title: config.errorTitle,
				description: error instanceof Error ? error.message : "Please try again.",
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const updateMessage = (type: ActionType, value: string) => {
		setMessages((prev) => ({ ...prev, [type]: value }));
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
			setMessages({ confirm: "", question: "" });
			setActiveTab("confirm");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Booking Options</DialogTitle>
					<DialogDescription>
						Choose to confirm your booking or ask questions about the quote from{" "}
						{quote?.providerName}.
					</DialogDescription>
				</DialogHeader>

				{quote && (
					<div className="space-y-4">
						<div className="rounded-lg border bg-primary/10 p-4">
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Provider:</span>
								<span>{quote.providerName}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Amount:</span>
								<span>£{quote.amount ? quote.amount.toFixed(2) : "TBD"}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Quote ID:</span>
								<span>{quote.quoteId.slice(0, 8)}</span>
							</div>
						</div>

						<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActionType)}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="confirm" className="flex items-center gap-2">
									<Check className="size-4" />
									Confirm Booking
								</TabsTrigger>
								<TabsTrigger value="question" className="flex items-center gap-2">
									<MessageSquare className="size-4" />
									Ask Questions
								</TabsTrigger>
							</TabsList>

							<QuoteConfirmationTab
								type="confirm"
								messages={messages}
								submitting={submitting}
								updateMessage={updateMessage}
								handleWriteWithAI={handleWriteWithAI}
								handleEnhanceMessage={handleEnhanceMessage}
								handleSubmitAction={handleSubmitAction}
							/>
							<QuoteConfirmationTab
								type="question"
								messages={messages}
								submitting={submitting}
								updateMessage={updateMessage}
								handleWriteWithAI={handleWriteWithAI}
								handleEnhanceMessage={handleEnhanceMessage}
								handleSubmitAction={handleSubmitAction}
							/>
						</Tabs>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
