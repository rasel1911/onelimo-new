import { generateObject } from "ai";

import { MODEL_IDS } from "@/lib/ai/config";
import { Gemini } from "@/lib/ai/utils";

import { WRITER_CONFIG } from "./constants";
import { generateBookingResponsePrompt } from "./prompts/booking-response";
import { WriterResponseSchema } from "./schemas";
import { WriterInput, WriterResult } from "./types";

/**
 * Improve booking response text using AI with booking-specific context
 * @param input - The input object containing the text and action
 * @param bookingContext - Additional booking context for better responses
 * @returns The writer result with improved booking response text
 */
export const improveBookingResponse = async (
	input: WriterInput,
	bookingContext?: any,
): Promise<WriterResult> => {
	try {
		console.log(`✍️ Improving booking response with action: ${input.action}`);

		const prompt = generateBookingResponsePrompt(input, bookingContext);

		const result = await generateObject({
			model: Gemini(MODEL_IDS.GEMINI_FLASH_2_0),
			prompt,
			schema: WriterResponseSchema,
			temperature: WRITER_CONFIG.TEMPERATURE,
			maxRetries: WRITER_CONFIG.MAX_RETRIES,
		});

		const writerResult: WriterResult = {
			originalText: input.text,
			improvedText: result.object.improvedText,
			action: input.action,
			improvements: result.object.improvements,
			confidence: result.object.confidence,
			processedAt: new Date(),
		};

		console.log(`✅ Booking response improved with ${writerResult.confidence}% confidence`);
		return writerResult;
	} catch (error) {
		console.error("❌ Failed to improve booking response:", error);

		return {
			originalText: input.text,
			improvedText: input.text,
			action: input.action,
			improvements: ["Could not process booking response improvement"],
			confidence: 0,
			processedAt: new Date(),
		};
	}
};
