import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { HTTPMethods } from "@upstash/qstash";
import { WorkflowAbort, WorkflowContext } from "@upstash/workflow";

/**
 * Create a Workflow-compatible Google Generative AI client
 * This follows the Upstash Workflow AI SDK integration pattern
 */
export const createWorkflowGoogleAI = (context: WorkflowContext) => {
	return createGoogleGenerativeAI({
		fetch: async (input, init) => {
			try {
				const headers = init?.headers
					? Object.fromEntries(new Headers(init.headers).entries())
					: {};

				const body = init?.body ? JSON.parse(init.body as string) : undefined;

				const responseInfo = await context.call("google-ai-call", {
					url: input.toString(),
					method: init?.method as HTTPMethods,
					headers,
					body,
				});

				const responseHeaders = new Headers(
					Object.entries(responseInfo.header).reduce(
						(acc, [key, values]) => {
							acc[key] = values.join(", ");
							return acc;
						},
						{} as Record<string, string>,
					),
				);

				const responseBody =
					typeof responseInfo.body === "string"
						? responseInfo.body
						: JSON.stringify(responseInfo.body);

				return new Response(responseBody, {
					status: responseInfo.status,
					headers: responseHeaders,
				});
			} catch (error) {
				if (error instanceof WorkflowAbort) {
					throw error;
				} else {
					console.error("Error in Google AI fetch implementation:", error);
					throw error;
				}
			}
		},
	});
};
