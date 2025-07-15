import { generateObject } from "ai";

import { MODEL_IDS } from "@/lib/ai/config";
import { Gemini } from "@/lib/ai/utils";

import { WRITER_CONFIG } from "./constants";
import { generateWriterPrompt } from "./prompts/special-note";
import { WriterResponseSchema } from "./schemas";
import { WriterInput, WriterResult } from "./types";

/**
 * Analyze and improve text using AI writer
 * @param input - The input object containing the text and action
 * @returns The writer result with improved text
 */
export const improveText = async (input: WriterInput): Promise<WriterResult> => {
	try {
		console.log(`✍️ Improving text with action: ${input.action}`);

		const prompt = generateWriterPrompt(input);

		const result = await generateObject({
			model: Gemini(MODEL_IDS.GEMINI_FLASH_2_5),
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

		console.log(`✅ Text improved with ${writerResult.confidence}% confidence`);
		return writerResult;
	} catch (error) {
		console.error("❌ Failed to improve text:", error);

		return {
			originalText: input.text,
			improvedText: input.text,
			action: input.action,
			improvements: ["Could not process text improvement"],
			confidence: 0,
			processedAt: new Date(),
		};
	}
};
