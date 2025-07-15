export interface WriterInput {
	text: string;
	action: "rewrite" | "grammar" | "enhance" | "simplify" | "custom" | "generate";
	context?: "special_request" | "booking_note" | "customer_message" | "general";
	customPrompt?: string;
}

export interface WriterResult {
	originalText: string;
	improvedText: string;
	action: string;
	improvements: string[];
	confidence: number;
	processedAt: Date;
}
