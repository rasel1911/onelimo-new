import { ConfirmationAnalyzerInput } from "./types";

export const generateConfirmationAnalysisPrompt = (input: ConfirmationAnalyzerInput): string => {
	const { userMessage, bookingContext, userAction } = input;

	const contextInfo = bookingContext
		? `
<booking-context>
<booking-id>${bookingContext.bookingId}</booking-id>
<service>${bookingContext.serviceName}</service>
<scheduled-date>${bookingContext.scheduledDate}</scheduled-date>
<provider>${bookingContext.providerName}</provider>
<amount>£${bookingContext.amount}</amount>
</booking-context>
`
		: "";

	return `You are analyzing a customer's message regarding their booking confirmation. Your task is to understand their intent and provide structured analysis.

${contextInfo}

CUSTOMER MESSAGE:
"${userMessage}"

USER ACTION: ${userAction}

Analyze this message and determine:
1. The customer's PRIMARY INTENT:
   - confirmation: Customer is confirming/accepting the booking
   - question: Customer has questions about the booking
   - concern: Customer has concerns or issues
   - cancellation: Customer wants to cancel
   - other: Unclear or different intent

2. CONFIDENCE LEVEL (0-100): How confident are you in the intent classification?

3. REFINED MESSAGE: Rewrite the customer's message using clear, simple English while preserving the original meaning and tone.

4. KEY POINTS: Extract 2-4 main points from the message.

5. URGENCY LEVEL:
   - high: Needs immediate attention (contains urgent language)
   - medium: Should be addressed soon (time-sensitive)
   - low: Can be handled normally

6. REQUIRES RESPONSE: Does this message require a direct response from us?

7. SENTIMENT: Overall emotional tone (positive/neutral/negative)

8. REASONING: Brief explanation of why you classified the intent this way.

Focus on accuracy and be conservative with confidence scores. If unsure, choose "other" for intent.`;
};
