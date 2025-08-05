import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";

import { MODEL_IDS } from "@/lib/ai/config";

import { RESPONSE_ANALYZER_CONFIG } from "./constants";
import { quoteRecommendationPrompt } from "./prompts/recommendation";
import { batchResponseAnalysisPrompt } from "./prompts/response-analysis";
import { BatchResponseAnalysisSchema, RecommendationSchema } from "./schemas";
import {
	ResponseAnalyzerInput,
	ResponseComparisonAnalysis,
	ResponseAnalysisResult,
	ResponseRecommendationResult,
} from "./types";
import {
	calculateOverallScore,
	calculateProfessionalismScore,
	calculateSeriousnessScore,
	calculateViabilityScore,
	generateConcerns,
	generateKeyPoints,
	generateStrengths,
	shouldRecommendQuote,
	calculateMarketCompetition,
	calculateResponseQuality,
} from "./utils";
import { Gemini } from "../../utils";

/**
 * Generate fallback analysis when AI fails
 */
function generateFallbackAnalysis(
	quotes: ResponseAnalyzerInput["quotes"],
	bookingRequest: ResponseAnalyzerInput["bookingRequest"],
): ResponseAnalysisResult[] {
	return quotes.map((quote) => {
		const viabilityScore = calculateViabilityScore(quote, bookingRequest);
		const seriousnessScore = calculateSeriousnessScore(quote);
		const professionalismScore = calculateProfessionalismScore(quote);
		const overallScore = calculateOverallScore(
			viabilityScore,
			seriousnessScore,
			professionalismScore,
		);

		const isRecommended = shouldRecommendQuote(
			overallScore,
			viabilityScore,
			seriousnessScore,
			professionalismScore,
		);

		const strengths = generateStrengths(
			viabilityScore,
			seriousnessScore,
			professionalismScore,
			quote,
		);
		const concerns = generateConcerns(
			viabilityScore,
			seriousnessScore,
			professionalismScore,
			quote,
		);
		const keyPoints = generateKeyPoints(quote, overallScore, viabilityScore);

		return {
			id: quote.id,
			providerId: quote.providerId,
			bookingRequestId: bookingRequest.id,
			workflowProviderId: quote.workflowProviderId,
			responseType: "fallback",
			providerName: quote.providerName,
			overallScore,
			viabilityScore,
			seriousnessScore,
			professionalismScore,
			strengths,
			concerns,
			keyPoints,
			analysisNotes: `Comprehensive analysis: Overall score ${overallScore}/100 based on viability (${viabilityScore}/100), seriousness (${seriousnessScore}/100), and professionalism (${professionalismScore}/100). ${quote.status === "declined" ? "Quote declined by provider." : "Quote accepted and analyzed."}`,
			isRecommended,
			recommendationReason: isRecommended
				? `Recommended based on strong overall performance (${overallScore}/100) meeting all minimum thresholds.`
				: `Not recommended due to scores below minimum thresholds: Overall=${overallScore}, Viability=${viabilityScore}, Seriousness=${seriousnessScore}, Professionalism=${professionalismScore}.`,
			quoteAmount: quote.quoteAmount,
			responseNote: quote.responseNote,
			reason: quote.reason,
			analyzedAt: new Date(),
		};
	});
}

/**
 * Generate fallback recommendations when AI fails
 */
function generateFallbackRecommendations(
	analyses: ResponseAnalysisResult[],
): ResponseRecommendationResult {
	const recommended = analyses.filter((a) => a.isRecommended);
	const rejected = analyses.filter((a) => !a.isRecommended);

	let selectedQuotes = recommended;
	if (selectedQuotes.length === 0 && analyses.length > 0) {
		selectedQuotes = [analyses.sort((a, b) => b.overallScore - a.overallScore)[0]];
	}

	const averageScore =
		analyses.length > 0
			? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
			: 0;

	let overallQuality = "poor";
	if (averageScore >= 85) overallQuality = "excellent";
	else if (averageScore >= 70) overallQuality = "good";
	else if (averageScore >= 55) overallQuality = "fair";

	let recommendationStrength = "weak";
	if (selectedQuotes.length > 0 && averageScore >= 70) recommendationStrength = "strong";
	else if (selectedQuotes.length > 0 && averageScore >= 55) recommendationStrength = "moderate";

	return {
		selectedQuotes: selectedQuotes.slice(0, 4),
		rejectedQuotes: rejected,
		totalAnalyzed: analyses.length,
		recommendedCount: selectedQuotes.length,
		averageScore,
		marketInsights: [
			`Analyzed ${analyses.length} quotes with average score of ${averageScore}/100`,
			`${selectedQuotes.length} quotes met recommendation criteria`,
			`Market competition level: ${calculateMarketCompetition(analyses.length)}`,
			`Overall response quality: ${calculateResponseQuality(analyses)}`,
		],
		selectionStrategy:
			"Algorithmic selection based on comprehensive scoring and minimum thresholds",
		confidenceLevel: Math.min(85, Math.max(60, averageScore)),
		overallQuality,
		recommendationStrength,
	};
}

/**
 * Analyze responses using AI batch processing
 */
async function analyzeResponsesBatch(
	input: ResponseAnalyzerInput,
): Promise<ResponseAnalysisResult[]> {
	try {
		const result = await generateObject({
			model: Gemini(MODEL_IDS.GEMINI_FLASH_2_5),
			temperature: RESPONSE_ANALYZER_CONFIG.TEMPERATURE,
			maxTokens: RESPONSE_ANALYZER_CONFIG.MAX_TOKENS,
			maxRetries: RESPONSE_ANALYZER_CONFIG.MAX_RETRIES,
			schema: BatchResponseAnalysisSchema,
			prompt: batchResponseAnalysisPrompt(input.quotes, input.bookingRequest),
		});

		const cleanedAnalyses = result.object.analyses.map((analysis) => {
			const originalQuote = input.quotes.find((q) => q.id === analysis.id);
			if (!originalQuote) {
				console.warn(`Could not find original quote for analysis ID: ${analysis.id}`);
			}

			return {
				...analysis,
				id: originalQuote?.id || analysis.id,
				providerId: originalQuote?.providerId || analysis.providerId || "",
				bookingRequestId: input.bookingRequest.id,
				workflowProviderId: originalQuote?.workflowProviderId || analysis.workflowProviderId || "",
				strengths: Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 4) : [],
				concerns: Array.isArray(analysis.concerns) ? analysis.concerns.slice(0, 3) : [],
				analyzedAt: new Date(),
			};
		});

		return cleanedAnalyses;
	} catch (error) {
		console.error("AI batch analysis failed, using fallback:", error);
		return generateFallbackAnalysis(input.quotes, input.bookingRequest);
	}
}

/**
 * Generate recommendations using AI
 */
async function generateRecommendations(
	analyses: ResponseAnalysisResult[],
	bookingRequest: ResponseAnalyzerInput["bookingRequest"],
): Promise<ResponseRecommendationResult> {
	try {
		const result = await generateObject({
			model: Gemini(MODEL_IDS.GEMINI_FLASH_2_5),
			temperature: RESPONSE_ANALYZER_CONFIG.TEMPERATURE,
			maxTokens: RESPONSE_ANALYZER_CONFIG.MAX_TOKENS,
			maxRetries: RESPONSE_ANALYZER_CONFIG.MAX_RETRIES,
			schema: RecommendationSchema,
			prompt: quoteRecommendationPrompt(analyses, bookingRequest),
		});

		const selectedQuotes = analyses.filter((a) => result.object.selectedQuotes.includes(a.id));
		const rejectedQuotes = analyses.filter((a) =>
			(result.object.rejectedQuotes || []).includes(a.id),
		);

		let finalSelectedQuotes = selectedQuotes;
		if (finalSelectedQuotes.length === 0 && analyses.length > 0) {
			const highestScoring = analyses.sort((a, b) => b.overallScore - a.overallScore)[0];
			finalSelectedQuotes = [highestScoring];
			console.warn(
				"No quotes were selected by AI, defaulting to highest scoring quote:",
				highestScoring.id,
			);
		}

		const finalRejectedQuotes = rejectedQuotes.filter(
			(quote) => !finalSelectedQuotes.some((selected) => selected.id === quote.id),
		);

		const selectionReasonsMap: Record<string, string> = {};
		const rejectionReasonsMap: Record<string, string> = {};

		if (result.object.selectionReasonsText && result.object.selectionReasonsText.trim()) {
			const selectionPairs = result.object.selectionReasonsText.split("|");
			selectionPairs.forEach((pair) => {
				const [quoteId, ...reasonParts] = pair.split(":");
				if (quoteId && reasonParts.length > 0) {
					selectionReasonsMap[quoteId.trim()] = reasonParts.join(":").trim();
				}
			});
		}

		if (result.object.rejectionReasonsText && result.object.rejectionReasonsText.trim()) {
			const rejectionPairs = result.object.rejectionReasonsText.split("|");
			rejectionPairs.forEach((pair) => {
				const [quoteId, ...reasonParts] = pair.split(":");
				if (quoteId && reasonParts.length > 0) {
					rejectionReasonsMap[quoteId.trim()] = reasonParts.join(":").trim();
				}
			});
		}

		finalSelectedQuotes.forEach((quote) => {
			quote.recommendationReason = selectionReasonsMap[quote.id] || quote.recommendationReason;
		});
		finalRejectedQuotes.forEach((quote) => {
			quote.recommendationReason = rejectionReasonsMap[quote.id] || quote.recommendationReason;
		});

		const averageScore =
			analyses.length > 0
				? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
				: 0;

		return {
			selectedQuotes: finalSelectedQuotes,
			rejectedQuotes: finalRejectedQuotes,
			totalAnalyzed: analyses.length,
			recommendedCount: finalSelectedQuotes.length,
			averageScore,
			marketInsights: result.object.marketInsights || [],
			selectionStrategy: result.object.selectionStrategy || "Default selection strategy applied",
			confidenceLevel: result.object.confidenceLevel || 50,
			overallQuality: result.object.overallQuality || "fair",
			recommendationStrength: result.object.recommendationStrength || "moderate",
		};
	} catch (error) {
		console.error("AI recommendation failed, using fallback:", {
			error: error instanceof Error ? error.message : String(error),
			analysesCount: analyses.length,
			bookingRequestId: bookingRequest.id,
			timestamp: new Date().toISOString(),
		});
		return generateFallbackRecommendations(analyses);
	}
}

/**
 * Main function to analyze responses in workflow
 */
export async function analyzeResponsesInWorkflow(
	input: ResponseAnalyzerInput,
): Promise<ResponseComparisonAnalysis> {
	if (!input.quotes || input.quotes.length === 0 || !input.bookingRequest) {
		return {
			status: "no-quotes",
			error: "No quotes provided for analysis",
			totalQuotes: 0,
			acceptedQuotes: 0,
			declinedQuotes: 0,
			quoteAnalyses: [],
			recommendations: {
				selectedQuotes: [],
				rejectedQuotes: [],
				totalAnalyzed: 0,
				recommendedCount: 0,
				averageScore: 0,
				marketInsights: [],
				selectionStrategy: "",
				confidenceLevel: 0,
				overallQuality: "poor",
				recommendationStrength: "weak",
			},
			averageViability: 0,
			averageSeriousness: 0,
			averageProfessionalism: 0,
			marketOverview: {
				competitionLevel: "low",
				responseQuality: "poor",
				priceRange: { min: 0, max: 0, average: 0 },
			},
		};
	}

	const quoteAnalyses = await analyzeResponsesBatch(input);
	const recommendations = await generateRecommendations(quoteAnalyses, input.bookingRequest);

	const acceptedQuotes = input.quotes.filter((q) => q.status === "accepted").length;
	const declinedQuotes = input.quotes.filter((q) => q.status === "declined").length;

	const averageViability =
		quoteAnalyses.length > 0
			? Math.round(
					quoteAnalyses.reduce((sum, a) => sum + a.viabilityScore, 0) / quoteAnalyses.length,
				)
			: 0;
	const averageSeriousness =
		quoteAnalyses.length > 0
			? Math.round(
					quoteAnalyses.reduce((sum, a) => sum + a.seriousnessScore, 0) / quoteAnalyses.length,
				)
			: 0;
	const averageProfessionalism =
		quoteAnalyses.length > 0
			? Math.round(
					quoteAnalyses.reduce((sum, a) => sum + a.professionalismScore, 0) / quoteAnalyses.length,
				)
			: 0;

	const acceptedAmounts = input.quotes
		.filter((q) => q.status === "accepted" && q.quoteAmount > 0)
		.map((q) => q.quoteAmount);

	const priceRange =
		acceptedAmounts.length > 0
			? {
					min: Math.min(...acceptedAmounts),
					max: Math.max(...acceptedAmounts),
					average: Math.round(
						acceptedAmounts.reduce((sum, amt) => sum + amt, 0) / acceptedAmounts.length,
					),
				}
			: { min: 0, max: 0, average: 0 };

	const marketOverview = {
		competitionLevel: calculateMarketCompetition(input.quotes.length),
		responseQuality: calculateResponseQuality(quoteAnalyses),
		priceRange,
	};

	return {
		totalQuotes: input.quotes.length,
		acceptedQuotes,
		declinedQuotes,
		quoteAnalyses,
		recommendations,
		averageViability,
		averageSeriousness,
		averageProfessionalism,
		marketOverview,
	};
}
