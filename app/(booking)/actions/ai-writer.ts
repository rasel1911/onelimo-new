"use server";

import { improveText } from "@/lib/ai/services/writer";
import { WriterInput } from "@/lib/ai/services/writer/types";

interface AIWriterActionInput {
	text: string;
	action: "rewrite" | "grammar" | "enhance" | "simplify" | "custom" | "generate";
	context?: "special_request" | "booking_note" | "customer_message" | "general";
	customPrompt?: string;
}

interface AIWriterActionResult {
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
 * @description Improve text using AI writer service
 * @param input - The input object containing the text, action, context, and custom prompt
 * @returns The result of the AI writer action
 */
export const improveTextAction = async (
	input: AIWriterActionInput,
): Promise<AIWriterActionResult> => {
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
			context: input.context || "general",
			customPrompt: input.customPrompt,
		};

		const result = await improveText(writerInput);

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
		console.error("AI writer action error:", error);

		return {
			success: false,
			error: "Failed to improve text. Please try again.",
		};
	}
};
