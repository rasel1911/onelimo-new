"use client";

import {
	CheckCircle,
	Sparkles,
	Wand2,
	ArrowRight,
	Lightbulb,
	Loader2,
	AlertCircle,
	MessageSquare,
	Check,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { toast } from "@/hooks/use-toast";
import { ResponseAnalysisResult } from "@/lib/ai/services/responseAnalyzer";
import { cn } from "@/lib/utils";
import { GeneratedQuoteLink } from "@/lib/workflow/types/quote-link";

interface QuoteData {
	quotes: WorkflowQuote[];
	analysisOverview: ResponseAnalysisResult;
	selectedQuotes: WorkflowQuote[];
	analysisConfidence: number;
	linkData?: GeneratedQuoteLink;
	alreadySelected?: {
		quoteId: string;
		providerId: string;
		amount: number;
		message: string;
	} | null;
}

interface QuoteSelectionPageProps {
	params: {
		quotesHash: string;
	};
}

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

const MESSAGE_CONFIGS: Record<ActionType, MessageConfig> = {
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

export default function QuoteSelectionPage({ params }: QuoteSelectionPageProps) {
	const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedQuote, setSelectedQuote] = useState<WorkflowQuote | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [messages, setMessages] = useState<Record<ActionType, string>>({
		confirm: "",
		question: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<ActionType>("confirm");

	const fetchQuoteData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(`/api/bq/quotes/${params.quotesHash}`);

			if (!response.ok) {
				const errorData = await response.json();
				setError(errorData.error || "Failed to load quotes");
				return;
			}

			const data: QuoteData = await response.json();

			setQuoteData({
				...data,
				quotes: data.quotes,
			});
		} catch (error) {
			console.error("Error fetching quote data:", error);
			setError("Failed to load quotes. Please check your connection and try again.");
		} finally {
			setLoading(false);
		}
	}, [params.quotesHash]);

	useEffect(() => {
		fetchQuoteData();
	}, [fetchQuoteData]);

	const handleQuoteSelect = (quote: WorkflowQuote) => {
		setSelectedQuote(quote);
		setShowConfirmDialog(true);
		setActiveTab("confirm");
		setMessages({ confirm: "", question: "" });
	};

	const generateMessage = (template: string, quote: WorkflowQuote | null): string => {
		if (!quote) return template;

		return template
			.replace("{providerName}", quote.providerName)
			.replace("{amount}", quote.amount ? quote.amount.toFixed(2) : "TBD");
	};

	const handleWriteWithAI = async (type: ActionType) => {
		if (!selectedQuote) return;

		setSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const config = MESSAGE_CONFIGS[type];
		const generatedMessage = generateMessage(config.defaultMessage, selectedQuote);

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
		if (!selectedQuote || !currentMessage.trim()) {
			toast({
				title: "Missing Information",
				description: `Please provide ${type === "confirm" ? "a confirmation message" : "your question"}.`,
				variant: "destructive",
			});
			return;
		}

		try {
			setSubmitting(true);
			const response = await fetch(`/api/bq/quotes/${params.quotesHash}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quoteId: selectedQuote.quoteId,
					providerId: selectedQuote.providerId,
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
				description: `${type === "confirm" ? `Your quote from ${selectedQuote.providerName} ` : `Your question has been sent to ${selectedQuote.providerName}. `}${config.successDescription}`,
			});

			setShowConfirmDialog(false);

			if (type === "confirm") {
				await fetchQuoteData();
			} else {
				setMessages((prev) => ({ ...prev, question: "" }));
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

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex items-center gap-2">
					<Loader2 className="size-6 animate-spin" />
					<span>Loading your quotes...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<Alert>
					<AlertCircle className="size-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!quoteData) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<Alert>
					<AlertCircle className="size-4" />
					<AlertDescription>No quote data available.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (quoteData.alreadySelected) {
		return (
			<div className="container mx-auto mt-8 max-w-2xl px-4 py-8">
				<div className="text-center">
					<CheckCircle className="mx-auto size-16 text-green-600" />
					<h1 className="mt-4 text-2xl font-bold">Quote Already Selected</h1>
					<p className="mt-2 text-muted-foreground">
						You have already selected a quote for this booking.
					</p>
					<div className="mt-6 rounded-lg border bg-card p-4">
						<h3 className="font-semibold">Selected Quote Details</h3>
						<div className="mt-2 space-y-1 text-sm text-muted-foreground">
							<p>Quote ID: {quoteData.alreadySelected.quoteId.slice(0, 8)}</p>
							{quoteData.alreadySelected.amount > 0 && (
								<p>Amount: £{quoteData.alreadySelected.amount}</p>
							)}
							{quoteData.alreadySelected.message && (
								<p>Message: {quoteData.alreadySelected.message}</p>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (quoteData.quotes.length === 0) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<Alert>
					<AlertCircle className="size-4" />
					<AlertDescription>No quotes available.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Message Tab Component
	const MessageTab = ({ type }: { type: ActionType }) => {
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

	return (
		<div className="container mx-auto mt-8 px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold">Select Your Ride</h1>
				<p className="mt-2 text-muted-foreground">
					Choose from our recommended quotes for your journey
				</p>
				<div className="mt-2 text-sm font-medium text-muted-foreground">
					{quoteData?.quotes.length} quote{quoteData?.quotes.length !== 1 ? "s" : ""} available •{" "}
					{quoteData?.linkData?.expiresAt && (
						<span className="text-xs text-orange-600">
							Expires at {new Date(quoteData.linkData.expiresAt).toLocaleString()}
						</span>
					)}
				</div>
			</div>

			<div className="mx-auto max-w-2xl space-y-6">
				{quoteData?.quotes.map((quote) => (
					<Card
						key={quote.id.slice(0, 7)}
						className={cn(
							"group relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
							quote.isRecommended && "ring-2 ring-primary/20",
						)}
						onClick={() => handleQuoteSelect(quote)}
					>
						{quote.isRecommended && (
							<div className="absolute -top-2 left-16 z-10">
								<Badge className="bg-primary text-primary-foreground">
									<Sparkles className="mr-1 size-3" />
									Recommended
								</Badge>
							</div>
						)}
						{quote.isSelectedByAi && (
							<div className="absolute -top-2 left-4 z-10">
								<Badge className="bg-teal-500 text-primary-foreground">
									<Wand2 className="mr-1 size-4" />
								</Badge>
							</div>
						)}

						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl">{quote.providerName}</CardTitle>
								<div className="flex items-center gap-2">
									<span className="text-3xl font-bold">£{quote.amount}</span>
								</div>
							</div>
							<CardDescription className="text-sm">
								Quote ID: {quote.quoteId.slice(0, 8)}
								{quote.rating && <span className="ml-2">• Match: {quote.rating}/100</span>}
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Notes */}
							{quote.notes && (
								<div className="relative">
									<div className="relative rounded-r-lg border-l-4 border-primary bg-primary/10 p-4 shadow-sm">
										<div className="absolute right-2 top-2 size-3 rounded-full bg-primary shadow-sm"></div>
										<div className="mb-1 text-sm font-semibold text-primary">Notes:</div>
										<p className="text-sm text-primary">{quote.notes}</p>
									</div>
								</div>
							)}

							{/* Key Points */}
							{quote.strengths && quote.strengths.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
										<Lightbulb className="size-4" />
										<span>Strengths</span>
									</div>
									<div className="flex flex-wrap gap-2">
										{quote.strengths.map((point, index) => (
											<Badge key={index} variant="secondary" className="text-xs">
												{point.replace(/\.$/, "")}
											</Badge>
										))}
									</div>
								</div>
							)}

							<Button className="mt-6 w-full transition-colors group-hover:bg-primary/90" size="lg">
								Select this quote
								<ArrowRight className="ml-2 size-4" />
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Enhanced Confirmation Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Booking Options</DialogTitle>
						<DialogDescription>
							Choose to confirm your booking or ask questions about the quote from{" "}
							{selectedQuote?.providerName}.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="rounded-lg border bg-primary/10 p-4">
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Provider:</span>
								<span>{selectedQuote?.providerName}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Amount:</span>
								<span>£{selectedQuote?.amount ? selectedQuote.amount.toFixed(2) : "TBD"}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-primary">
								<span className="font-medium">Quote ID:</span>
								<span>{selectedQuote?.quoteId.slice(0, 8)}</span>
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

							<MessageTab type="confirm" />
							<MessageTab type="question" />
						</Tabs>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
