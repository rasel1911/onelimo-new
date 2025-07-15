export interface ConfirmationAnalyzerInput {
	workflowRunId: string;
	userMessage: string;
	userAction: string;
	bookingContext?: {
		bookingId: string;
		serviceName: string;
		pickupDate: string;
		pickupLocation: string;
		scheduledDate: string;
		dropoffLocation?: string;
		dropoffDate?: string;
		providerName: string;
		amount: number;
	};
}

export interface ConfirmationAnalyzerResult {
	userAction: string;
	intent: "confirm" | "question" | "concern" | "cancellation" | "other";
	confidence: number;
	originalMessage: string;
	refinedMessage: string;
	keyPoints: string[];
	contactInfo?: {
		email?: string;
		phone?: string;
		name?: string;
	};
	urgency: "low" | "medium" | "high";
	requiresResponse: boolean;
	sentiment: "positive" | "neutral" | "negative";
	analyzedAt: Date;
	reasoning: string;
}
