import { CONTACT_PATTERNS, URGENCY_KEYWORDS, INTENT_PATTERNS } from "./constants";
import { ConfirmationAnalyzerInput, ConfirmationAnalyzerResult } from "./types";

/**
 * Extract contact information from a message
 * @param message - The message to extract contact information from
 * @returns The contact information
 */
export const extractContactInfo = (message: string): ConfirmationAnalyzerResult["contactInfo"] => {
	const contactInfo: ConfirmationAnalyzerResult["contactInfo"] = {};

	const emailMatches = message.match(CONTACT_PATTERNS.EMAIL);
	if (emailMatches) {
		contactInfo.email = emailMatches[0];
	}

	const phoneMatches = message.match(CONTACT_PATTERNS.PHONE);
	if (phoneMatches) {
		contactInfo.phone = phoneMatches[0];
	}

	const nameMatches = message.match(CONTACT_PATTERNS.NAME);
	if (nameMatches) {
		contactInfo.name = nameMatches[1].trim();
	}

	return Object.keys(contactInfo).length > 0 ? contactInfo : undefined;
};

/**
 * Fallback analysis for confirmation messages that don't match any of the patterns
 * @param input - The input object containing the user message
 * @returns The confirmation analysis result
 */
export const fallbackAnalysis = (input: ConfirmationAnalyzerInput): ConfirmationAnalyzerResult => {
	const { userMessage } = input;
	const lowerMessage = userMessage.toLowerCase();

	let intent: ConfirmationAnalyzerResult["intent"] = "other";
	let confidence = 30;

	if (INTENT_PATTERNS.CONFIRMATION.some((pattern) => lowerMessage.includes(pattern))) {
		intent = "confirm";
		confidence = 70;
	} else if (INTENT_PATTERNS.QUESTION.some((pattern) => lowerMessage.includes(pattern))) {
		intent = "question";
		confidence = 60;
	} else if (INTENT_PATTERNS.CONCERN.some((pattern) => lowerMessage.includes(pattern))) {
		intent = "concern";
		confidence = 60;
	} else if (INTENT_PATTERNS.CANCELLATION.some((pattern) => lowerMessage.includes(pattern))) {
		intent = "cancellation";
		confidence = 70;
	}

	let urgency: ConfirmationAnalyzerResult["urgency"] = "low";
	if (URGENCY_KEYWORDS.HIGH.some((keyword) => lowerMessage.includes(keyword))) {
		urgency = "high";
	} else if (URGENCY_KEYWORDS.MEDIUM.some((keyword) => lowerMessage.includes(keyword))) {
		urgency = "medium";
	}

	return {
		userAction: "question",
		intent,
		confidence,
		originalMessage: userMessage,
		refinedMessage: userMessage,
		keyPoints: [userMessage.substring(0, 100)],
		contactInfo: extractContactInfo(userMessage),
		urgency,
		requiresResponse: intent !== "confirm",
		sentiment: intent === "confirm" ? "positive" : "neutral",
		analyzedAt: new Date(),
		reasoning: "Fallback analysis based on keyword matching",
	};
};
