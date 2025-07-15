import { z } from "zod";

export const WriterResponseSchema = z.object({
	improvedText: z.string().describe("The improved version of the original text"),
	improvements: z
		.array(z.string())
		.max(5)
		.describe("List of specific improvements made to the text"),
	confidence: z
		.number()
		.min(0)
		.max(1)
		.describe("Confidence level in the improvement quality (0-1)"),
	maintainedIntent: z.boolean().describe("Whether the original intent and meaning was preserved"),
});
