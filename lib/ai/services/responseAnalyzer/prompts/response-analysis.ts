import { BookingRequest } from "@/db/schema/bookingRequest.schema";

import { RawResponseData } from "../types";
import { formatBookingContext, formatQuoteForPrompt } from "../utils";

export const batchResponseAnalysisPrompt = (
	quotes: RawResponseData[],
	bookingRequest: BookingRequest,
) => {
	const quotesText = quotes.map((quote, index) => formatQuoteForPrompt(quote, index)).join("\n\n");

	return `
You are an AI Concierge for Onelimo luxury limousine service. Analyze ALL provided quotes with comprehensive scoring and detailed assessment focusing on response viability, provider seriousness, and communication professionalism.

BOOKING CONTEXT:
${formatBookingContext(bookingRequest)}

QUOTES TO ANALYZE:
<quotes>
${quotesText}
</quotes>

TASK: Analyze each quote with consistent scoring criteria.

REQUIREMENTS:
1. MUST analyze ALL quotes in the provided list
2. Use exact tracking IDs: 'id', 'providerId', 'workflowProviderId' from quote data
3. Apply scoring thresholds: Overall ≥65, Viability ≥60, Seriousness ≥55, Professionalism ≥50
4. Provide detailed analysis for each quote
5. Include comprehensive batch summary

SCORING CRITERIA (0-100 each):
- VIABILITY: Service capability, special requests alignment: "${bookingRequest.specialRequests || "None"}", response completeness
- SERIOUSNESS: Provider commitment, professional approach, response quality, business communication
- PROFESSIONALISM: Communication clarity, grammar, courtesy, presentation polish
- OVERALL: Weighted average (Viability 40% + Seriousness 35% + Professionalism 25%)

ANALYSIS COMPONENTS FOR EACH QUOTE:
- strengths: [0-4 concise competitive advantages] (can be empty)
- concerns: [0-3 specific issues, prioritize most important] (can be empty)
- keyPoints: [2-5 critical factors, 6-10 words each] (REQUIRED)
- analysisNotes: "Comprehensive scoring rationale and observations" (REQUIRED)
- recommendation: "recommend"/"reject" based on threshold criteria

BATCH SUMMARY REQUIRED:
- averageScores: Calculate viability, seriousness, professionalism averages
- marketOverview: 
  - competitionLevel: "low/moderate/high" based on quantity/quality
  - responseQuality: "poor/fair/good/excellent" based on standards
  - priceRange: {min, max, average} with competitive analysis

OUTPUT FORMAT:
Each quote analysis must include exact tracking IDs and all scoring components. Focus on actionable insights for luxury service decision-making.

Be precise, consistent, and maintain luxury service quality expectations throughout analysis.
`.trim();
};
