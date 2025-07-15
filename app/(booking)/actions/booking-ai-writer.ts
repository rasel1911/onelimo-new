"use server";

import { improveBookingResponse } from "@/lib/ai/services/writer/booking-response-writer";
import { WriterInput } from "@/lib/ai/services/writer/types";

interface BookingAIWriterInput {
	text: string;
	action: "rewrite" | "grammar" | "enhance" | "simplify" | "custom" | "generate";
	context?: "special_request" | "booking_note" | "customer_message" | "general";
	customPrompt?: string;
	bookingContext?: {
		customerName?: string;
		vehicleType?: string;
		pickupLocation?: string;
		dropoffLocation?: string;
		pickupTime?: string;
		passengers?: number;
		specialRequests?: string;
		estimatedDuration?: number;
	};
}

interface BookingAIWriterResult {
	success: boolean;
	data?: {
		originalText: string;
		improvedText: string;
		action: string;
		improvements: string[];
		confidence: number;
	};
	error?: string;
}

/**
 * @description Improve booking response text using AI with booking-specific context
 * @param input - The input object containing the text, action, context, and booking details
 * @returns The result of the booking AI writer action
 */
export const improveBookingResponseAction = async (
	input: BookingAIWriterInput,
): Promise<BookingAIWriterResult> => {
	try {
		if (!input.text?.trim()) {
			return {
				success: false,
				error: "Text is required",
			};
		}

		if (input.text.length > 5000) {
			return {
				success: false,
				error: "Text is too long. Maximum 5,000 characters allowed.",
			};
		}

		if ((input.action === "custom" || input.action === "generate") && !input.customPrompt?.trim()) {
			return {
				success: false,
				error: `Custom prompt is required for ${input.action} action`,
			};
		}

		const writerInput: WriterInput = {
			text: input.text.trim(),
			action: input.action,
			context: input.context || "booking_note",
			customPrompt: input.customPrompt,
		};

		const result = await improveBookingResponse(writerInput, input.bookingContext);

		return {
			success: true,
			data: {
				originalText: result.originalText,
				improvedText: result.improvedText,
				action: result.action,
				improvements: result.improvements,
				confidence: result.confidence,
			},
		};
	} catch (error) {
		console.error("Booking AI writer action error:", error);

		return {
			success: false,
			error: "Failed to improve booking response. Please try again.",
		};
	}
};
