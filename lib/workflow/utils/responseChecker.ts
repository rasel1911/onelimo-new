import { getWorkflowProvidersByIds } from "@/db/queries/workflow/workflowProvider.queries";

export interface ResponseThresholdResult {
	totalProviders: number;
	respondedCount: number;
	quotedCount: number;
	acceptedCount: number;
	declinedCount: number;
	noResponseCount: number;
}

/**
 * Check if providers have met response and quote thresholds
 * @param workflowRunId - The workflow run ID to check providers for
 * @param responseThreshold - Minimum number of responses required (default: 1)
 * @param quoteThreshold - Minimum number of quotes required (default: 1)
 * @returns ResponseThresholdResult with threshold analysis
 */
export const checkProviderResponses = async (
	workflowRunId: string,
	workflowProviderIds: string[],
): Promise<ResponseThresholdResult> => {
	try {
		const providers = await getWorkflowProvidersByIds(workflowRunId, workflowProviderIds);

		const totalProviders = providers.length;
		let respondedCount = 0;
		let quotedCount = 0;
		let acceptedCount = 0;
		let declinedCount = 0;

		providers.forEach((provider) => {
			if (provider.hasResponded) {
				respondedCount++;

				if (provider.responseStatus === "accepted") {
					acceptedCount++;
				} else if (provider.responseStatus === "declined") {
					declinedCount++;
				}
			}

			if (provider.hasQuoted && provider.quoteAmount) {
				quotedCount++;
			}
		});

		const noResponseCount = totalProviders - respondedCount;

		console.log(`📊 Provider response check for workflow ${workflowRunId}:`, {
			totalProviders,
			respondedCount,
			quotedCount,
			acceptedCount,
			declinedCount,
			noResponseCount,
		});

		return {
			totalProviders,
			respondedCount,
			quotedCount,
			acceptedCount,
			declinedCount,
			noResponseCount,
		};
	} catch (error) {
		console.error("❌ Error checking provider responses:", error);

		return {
			totalProviders: 0,
			respondedCount: 0,
			quotedCount: 0,
			acceptedCount: 0,
			declinedCount: 0,
			noResponseCount: 0,
		};
	}
};
