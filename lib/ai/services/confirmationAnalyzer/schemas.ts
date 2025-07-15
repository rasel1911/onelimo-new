import { z } from "zod";

export const ConfirmationAnalysisSchema = z.object({
	intent: z
		.enum(["confirm", "question", "concern", "cancellation", "other"])
		.describe("The intent of the user's message"),
	confidence: z.number().min(0).max(100).describe("The AI's confidence level of the analysis"),
	refinedMessage: z
		.string()
		.describe("The refined message of the user's message with proper grammar and punctuation"),
	keyPoints: z.array(z.string()).describe("The key points based on the user's message"),
	urgency: z.enum(["low", "medium", "high"]).describe("The urgency of the user's message"),
	requiresResponse: z.boolean().describe("Whether the user's message requires a response"),
	sentiment: z
		.enum(["positive", "neutral", "negative"])
		.describe("The sentiment of the user's message"),
	reasoning: z.string().describe("The reasoning behind the intent"),
});
