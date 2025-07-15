import { generateObject } from "ai";

import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { getModelSettings, MODEL_IDS } from "@/lib/ai/config";
import { bookingAnalysisPrompt } from "@/lib/ai/services/bookingAnalyzer/prompts/original/booking-analysis";
import { contactAnalysisPrompt } from "@/lib/ai/services/bookingAnalyzer/prompts/original/contact-analysis";

import { CONTACT_ANALYSIS_CONFIG, DEFAULT_VALUES } from "./constants";
import { ContactAnalysisSchema, BookingAnalysisSchema } from "./schemas";
import { BookingAnalysis, ContactAnalysisResult } from "./types";
import { applyContactPenalty, formatBookingDetails, validateTextInput } from "./utils";
import { Gemini } from "../../utils";

export type { BookingData, BookingAnalysis } from "./types";

/**
 * Analyze and clean contact information from text using AI
 * @param text - The text to analyze
 * @returns The contact analysis result
 */
export const analyzeContactDetails = async (text: string): Promise<ContactAnalysisResult> => {
	const sanitizedText = validateTextInput(text);

	if (!sanitizedText) {
		return DEFAULT_VALUES.EMPTY_CONTACT_ANALYSIS;
	}

	const result = await generateObject({
		model: Gemini(MODEL_IDS.GEMINI_FLASH_2_5),
		temperature: CONTACT_ANALYSIS_CONFIG.TEMPERATURE,
		maxRetries: CONTACT_ANALYSIS_CONFIG.MAX_RETRIES,
		schema: ContactAnalysisSchema,
		prompt: contactAnalysisPrompt(sanitizedText),
	});

	return result.object as ContactAnalysisResult;
};

/**
 * Perform comprehensive booking analysis using AI
 * @param bookingRequest - The booking request to analyze
 * @param contactAnalysis - The contact analysis result
 * @returns The booking analysis result
 */
export const performBookingAnalysis = async (
	bookingRequest: BookingRequest,
	contactAnalysis: ContactAnalysisResult,
): Promise<BookingAnalysis> => {
	const specialRequests = bookingRequest.specialRequests || "";
	const modelSettings = getModelSettings("BOOKING_ANALYZER");
	const bookingDetails = formatBookingDetails(bookingRequest, contactAnalysis.cleanedMessage);

	const result = await generateObject({
		model: Gemini(MODEL_IDS.GEMINI_FLASH_2_5),
		temperature: modelSettings.temperature,
		maxRetries: CONTACT_ANALYSIS_CONFIG.MAX_RETRIES,
		schema: BookingAnalysisSchema,
		prompt: bookingAnalysisPrompt(contactAnalysis, specialRequests, bookingDetails),
	});

	const finalScore = applyContactPenalty(result.object.score, contactAnalysis);

	return {
		score: finalScore,
		urgency: result.object.urgency,
		complexity: result.object.complexity,
		estimatedValue: result.object.estimatedValue,
		refinedMessage: result.object.refinedMessage,
		keyPoints: result.object.keyPoints,
		contactDetailsDetected: contactAnalysis.hasContactDetails,
		originalMessage: specialRequests,
		cleanedMessage: contactAnalysis.cleanedMessage,
		feedbackMessage: result.object.feedbackMessage,
	};
};

/**
 * Analyze a booking request using AI within a workflow context
 * This function must be called within a workflow step
 * @param bookingRequest - The booking request to analyze
 * @returns The booking analysis result
 */
export const analyzeBookingRequestInWorkflow = async (
	bookingRequest: BookingRequest,
): Promise<BookingAnalysis> => {
	const specialRequests = bookingRequest.specialRequests || "No special requests";

	const contactAnalysis = await analyzeContactDetails(specialRequests);
	const bookingAnalysis = await performBookingAnalysis(bookingRequest, contactAnalysis);

	return bookingAnalysis;
};
