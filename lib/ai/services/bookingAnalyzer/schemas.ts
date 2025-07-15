import { z } from "zod";

/**
 * Schema for AI-based contact detection and cleaning
 */
export const ContactAnalysisSchema = z.object({
	hasContactDetails: z
		.boolean()
		.describe(
			"Whether the message contains any contact information like phone numbers, emails, social media handles, messaging app usernames, or requests for direct contact",
		),
	cleanedMessage: z
		.string()
		.describe(
			"The message with all contact information removed while preserving the core service request and requirements",
		),
	contactTypes: z
		.array(z.string())
		.describe(
			"Types of contact information detected (e.g., 'phone number', 'email', 'social media', 'messaging app')",
		),
	severity: z
		.enum(["low", "medium", "high"])
		.describe(
			"Severity of contact policy violation - low: subtle mentions, medium: direct contact info, high: aggressive contact attempts",
		),
});

/**
 * Schema for comprehensive booking analysis
 */
export const BookingAnalysisSchema = z.object({
	score: z.number().min(0).max(100).describe("0-100 score for booking viability"),
	urgency: z
		.enum(["low", "medium", "high"])
		.describe("Urgency level based on pickup time and special requirements"),
	complexity: z
		.enum(["simple", "moderate", "complex"])
		.describe("Complexity based on requirements and logistics"),
	estimatedValue: z.number().positive().describe("Estimated booking value in GBP"),
	refinedMessage: z
		.string()
		.describe("Professional message to send to service providers - be specific about requirements"),
	keyPoints: z.array(z.string()).describe("Key points about the booking"),
	feedbackMessage: z.string().describe("Feedback message about the message quality and any issues"),
});
