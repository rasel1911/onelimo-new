export const WRITER_CONFIG = {
	MAX_RETRIES: 2,
	TEMPERATURE: 0.4,
	MAX_TOKENS: 1500,
	TIMEOUT_MS: 25000,
} as const;

export const STYLE_GUIDELINES = {
	TONE: "friendly, polite, and professional",
	LANGUAGE: "British English",
	COMPLEXITY: "simple, clear, and easy to understand",
	AVOID: [
		"overly complex words",
		"jargon",
		"long sentences",
		"pompous language",
		"aggressive tone",
		"corporate speak",
	],
	PREFER: [
		"common everyday words",
		"short sentences",
		"active voice",
		"polite expressions",
		"clear instructions",
		"warm but professional tone",
	],
} as const;

export const CONTEXT_PROMPTS = {
	special_request:
		"This is a special request that a customer wants to send to their luxury car service provider. The customer is describing their specific needs or requirements.",
	booking_note:
		"This is a note that a customer wants to send to their service provider about a booking request. It should be professional and informative from the customer's perspective.",
	customer_message:
		"This is a message from a customer to their booking service provider. It should maintain the customer's intent while improving clarity.",
	general:
		"This is general text that needs improvement for clear communication between customer and service provider.",
} as const;

export const COMMON_IMPROVEMENTS = [
	"Improved grammar and spelling",
	"Simplified complex words",
	"Made tone more friendly",
	"Improved sentence structure",
	"Enhanced clarity",
	"Added polite expressions",
	"Fixed punctuation",
	"Made more concise",
] as const;
