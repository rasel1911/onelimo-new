import { z } from "zod";

export const ResponseAnalysisSchema = z.object({
	id: z.string().describe("Quote ID"),
	providerId: z.string().describe("Provider ID for tracking"),
	bookingRequestId: z.string().describe("Booking Request ID for tracking"),
	workflowProviderId: z.string().describe("Workflow Provider ID for tracking"),
	providerName: z.string().describe("Provider name"),

	overallScore: z.number().min(0).max(100).describe("Overall weighted score combining all factors"),
	viabilityScore: z.number().min(0).max(100).describe("Quote viability and feasibility score"),
	seriousnessScore: z
		.number()
		.min(0)
		.max(100)
		.describe("Provider seriousness and commitment level"),
	professionalismScore: z.number().min(0).max(100).describe("Communication professionalism score"),

	strengths: z.array(z.string()).min(0).max(4).describe("Key strengths of this quote (0-4 points)"),
	concerns: z.array(z.string()).min(0).max(3).describe("Potential concerns or issues (0-3 points)"),
	keyPoints: z
		.array(z.string())
		.min(2)
		.max(5)
		.describe("Important decision-making factors (2-5 points)"),
	analysisNotes: z.string().describe("Comprehensive analysis notes explaining the scoring"),

	isRecommended: z.boolean().describe("Whether this quote should be recommended"),
	recommendationReason: z.string().describe("Detailed reason for recommendation or rejection"),

	quoteAmount: z.number().describe("Quote amount in pence"),
	responseNote: z.string().describe("Original response note"),
	reason: z.string().optional().describe("Decline reason if applicable"),
});

export const BatchResponseAnalysisSchema = z.object({
	analyses: z.array(ResponseAnalysisSchema).describe("Array of individual quote analyses"),

	averageViability: z
		.number()
		.min(0)
		.max(100)
		.describe("Average viability score across all quotes"),
	averageSeriousness: z
		.number()
		.min(0)
		.max(100)
		.describe("Average seriousness score across all quotes"),
	averageProfessionalism: z
		.number()
		.min(0)
		.max(100)
		.describe("Average professionalism score across all quotes"),

	marketOverview: z
		.object({
			competitionLevel: z.enum(["low", "moderate", "high"]).describe("Market competition level"),
			responseQuality: z
				.enum(["poor", "fair", "good", "excellent"])
				.describe("Overall response quality"),
			priceRange: z
				.object({
					min: z.number().describe("Minimum quote amount"),
					max: z.number().describe("Maximum quote amount"),
					average: z.number().describe("Average quote amount"),
				})
				.describe("Price range analysis"),
		})
		.describe("Market overview and competitive analysis"),
});

export const RecommendationSchema = z.object({
	selectedQuotes: z
		.array(z.string())
		.min(1)
		.describe("IDs of selected/recommended quotes (at least 1 required)"),
	rejectedQuotes: z.array(z.string()).optional().describe("IDs of rejected quotes (can be empty)"),
	selectionReasonsText: z
		.string()
		.optional()
		.describe("Detailed explanation of why each selected quote was chosen"),
	rejectionReasonsText: z
		.string()
		.optional()
		.describe("Detailed explanation of why each rejected quote was not chosen"),
	marketInsights: z
		.array(z.string())
		.min(1)
		.max(5)
		.describe("Key market insights (6-10 words each)"),
	selectionStrategy: z.string().min(10).describe("Overall selection strategy explanation"),
	confidenceLevel: z.number().min(0).max(100).describe("AI confidence in recommendations (0-100)"),
	overallQuality: z
		.enum(["poor", "fair", "good", "excellent"])
		.describe("Overall quality of available quotes"),
	recommendationStrength: z
		.enum(["weak", "moderate", "strong"])
		.describe("Strength of recommendations"),
});
