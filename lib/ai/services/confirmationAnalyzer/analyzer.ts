import { generateObject } from "ai";

import { MODEL_IDS } from "@/lib/ai/config";
import { Gemini } from "@/lib/ai/utils";

import { CONFIRMATION_ANALYZER_CONFIG } from "./constants";
import { generateConfirmationAnalysisPrompt } from "./prompt";
import { ConfirmationAnalysisSchema } from "./schemas";
import { ConfirmationAnalyzerInput, ConfirmationAnalyzerResult } from "./types";
import { extractContactInfo, fallbackAnalysis } from "./utils";

/**
 * Analyze a confirmation message and return the analysis result
 * @param input - The input object containing the user message and booking context
 * @returns The confirmation analysis result
 */
export const analyzeConfirmationMessage = async (
	input: ConfirmationAnalyzerInput,
): Promise<ConfirmationAnalyzerResult> => {
	try {
		console.log(`🔍 Analyzing confirmation message for workflow ${input.workflowRunId}`);

		const prompt = generateConfirmationAnalysisPrompt(input);

		const result = await generateObject({
			model: Gemini(MODEL_IDS.GEMINI_FLASH_2_0),
			prompt,
			schema: ConfirmationAnalysisSchema,
			temperature: CONFIRMATION_ANALYZER_CONFIG.TEMPERATURE,
			maxRetries: CONFIRMATION_ANALYZER_CONFIG.MAX_RETRIES,
		});

		const analysis: ConfirmationAnalyzerResult = {
			userAction: input.userAction,
			intent: result.object.intent,
			confidence: result.object.confidence,
			originalMessage: input.userMessage,
			refinedMessage: result.object.refinedMessage,
			keyPoints: result.object.keyPoints,
			contactInfo: extractContactInfo(input.userMessage),
			urgency: result.object.urgency,
			requiresResponse: result.object.requiresResponse,
			sentiment: result.object.sentiment,
			analyzedAt: new Date(),
			reasoning: result.object.reasoning,
		};

		console.log(`✅ Confirmation analysis completed with ${analysis.confidence}% confidence`);
		return analysis;
	} catch (error) {
		console.error("❌ Failed to analyze confirmation message:", error);
		console.log("🔄 Using fallback analysis");
		return fallbackAnalysis(input);
	}
};
