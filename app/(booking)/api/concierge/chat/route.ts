import { google } from "@ai-sdk/google";
import { streamText } from "ai";

import { APP_CONFIG, ERROR_MESSAGES } from "@/app/(booking)/concierge/constants";
import { agentTools } from "@/app/(booking)/concierge/tools";
import { buildSystemPrompt } from "@/app/(booking)/concierge/utils/booking-system-prompt";


export const POST = async (req: Request) => {
	try {
		const { messages, bookingContext, userName } = await req.json();

		const enhancedSystemPrompt = buildSystemPrompt({
			bookingContext,
			userName,
		});

		const result = streamText({
			model: google("gemini-2.5-flash"),
			system: enhancedSystemPrompt,
			messages,
			maxSteps: APP_CONFIG.MAX_BOOKING_STEPS,
			toolChoice: "auto",
			tools: agentTools,
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Chat API error:", error);
		return new Response(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, { status: 500 });
	}
};
