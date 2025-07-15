// Main analyzer function
export { analyzeResponsesInWorkflow } from "./analyzer";

// Types
export type {
	ResponseAnalyzerInput,
	RawResponseData,
	ResponseAnalysisResult,
	ResponseRecommendationResult,
	ResponseComparisonAnalysis,
	GoogleAI,
} from "./types";

// Constants
export {
	RESPONSE_ANALYZER_CONFIG,
	SCORING_THRESHOLDS,
	ANALYSIS_WEIGHTS,
	RESPONSE_QUALITY_INDICATORS,
	MARKET_ANALYSIS_THRESHOLDS,
	DEFAULT_VALUES,
} from "./constants";

// Utilities
export {
	calculateViabilityScore,
	calculateSeriousnessScore,
	calculateProfessionalismScore,
	calculateOverallScore,
	shouldRecommendQuote,
	generateStrengths,
	generateConcerns,
	generateKeyPoints,
	calculateMarketCompetition,
	calculateResponseQuality,
	formatBookingContext,
	formatQuoteForPrompt,
} from "./utils";

// Schemas
export {
	ResponseAnalysisSchema,
	BatchResponseAnalysisSchema,
	RecommendationSchema,
} from "./schemas";

// Prompts
export { batchResponseAnalysisPrompt } from "./prompts/response-analysis";
export { quoteRecommendationPrompt } from "./prompts/recommendation";
