import { BookingRequest } from "@/db/schema/bookingRequest.schema";

import { ResponseAnalysisResult } from "../types";
import { formatAnalysisForPrompt, formatBookingContext } from "../utils";

export const quoteRecommendationPrompt = (
	analyses: ResponseAnalysisResult[],
	bookingRequest: BookingRequest,
) => {
	const analysisText = analyses.map(formatAnalysisForPrompt).join("\n\n");

	return `
You are an AI assistant for a luxury limousine booking service Onelimo. Analyze the provided quotes and make recommendations.

BOOKING CONTEXT:
${formatBookingContext(bookingRequest)}

ANALYZED QUOTES WITH SCORES:
<analyses>
   ${analysisText}
</analyses>

TASK: Select the best quotes for the customer.

REQUIREMENTS:
1. MUST select at least 1 quote ID from the available quotes
2. Can select up to 3 quotes maximum
3. Provide market insights (2-4 short phrases, 6-10 words each)
4. Explain your selection strategy briefly
5. Rate your confidence (0-100) on the recommendation
6. Assess overall quality: poor/fair/good/excellent
7. Rate recommendation strength: weak/moderate/strong

SELECTION CRITERIA:
- Prioritize quotes with scores: Overall ≥65, Viability ≥60, Seriousness ≥55, Professionalism ≥50
- If no quotes meet thresholds, select the highest-scoring quote
- Consider customer needs: "${bookingRequest.specialRequests || "Standard service"}"
- Balance price, quality, and reliability

OUTPUT FORMAT:
- selectedQuotes: ["quote_id_1", "quote_id_2"] (REQUIRED - at least 1)
- rejectedQuotes: ["quote_id_3"] (OPTIONAL - can be empty)
- marketInsights: ["insight 1", "insight 2"] (REQUIRED - 2-4 insights)
- selectionStrategy: "Brief explanation of selection approach" (REQUIRED)
- confidenceLevel: 85 (REQUIRED - number 0-100)
- overallQuality: "good" (REQUIRED - poor/fair/good/excellent)
- recommendationStrength: "strong" (REQUIRED - weak/moderate/strong)

Be concise and focus on practical customer value.
`.trim();
};
