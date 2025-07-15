import { getWorkflowProvidersByIdsLazy } from "@/db/queries/workflow/workflowProvider.queries";
import { createWorkflowQuotesFromAnalysis } from "@/db/queries/workflow/workflowQuote.queries";
import { updateWorkflowRunWithQuoteAnalysis } from "@/db/queries/workflow/workflowRun.queries";
import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { analyzeResponsesInWorkflow } from "@/lib/ai/services/responseAnalyzer/analyzer";

import { WorkflowTrackingService } from "../services/workflowTrackingService";

export const analyzeQuotesStep = async (
	workflowRunId: string,
	bookingRequest: BookingRequest,
	workflowProvidersIds: string[],
) => {
	const quotesData = await getWorkflowProvidersByIdsLazy(workflowRunId, workflowProvidersIds);
	try {
		const quoteAnalysis = await analyzeResponsesInWorkflow({
			workflowRunId,
			quotes: quotesData.map((quote) => ({
				...quote,
				providerId: quote.providerId || "",
				providerName: quote.providerName,
				quoteAmount: quote.quoteAmount || 0,
				responseNote: quote.responseNote || "",
				responseTime: quote.responseTime || new Date(),
				providerRating: quote.providerRating || 90,
				providerReliability: quote.providerReliability || 90,
				status: quote.status as "accepted" | "declined" | "pending",
			})),
			bookingRequest,
		});

		if (quoteAnalysis.quoteAnalyses && quoteAnalysis.quoteAnalyses.length > 0) {
			const selectedQuoteIds = quoteAnalysis.recommendations.selectedQuotes.map(
				(quote) => quote.id,
			);

			const createdQuotes = await createWorkflowQuotesFromAnalysis(
				workflowRunId,
				quoteAnalysis.quoteAnalyses,
				selectedQuoteIds,
				"ai",
				"1.0.0",
			);
			console.log(`✅ Stored ${createdQuotes.length} quote analyses in database`);
			if (createdQuotes.length > 0) {
				try {
					console.log(
						`📧 Sending customer notifications for ${createdQuotes.length} selected quotes`,
					);

					const { getWorkflowRunByWorkflowRunId } = await import(
						"@/db/queries/workflow/workflowRun.queries"
					);
					const workflowRun = await getWorkflowRunByWorkflowRunId(workflowRunId);
					const customerEmail = workflowRun?.customerEmail;
					const customerPhone = workflowRun?.customerPhone;

					if (!customerEmail && !customerPhone) {
						console.warn(`⚠️ No customer contact information available for notifications`);
					} else {
						const { notificationService } = await import("../communication/communication-factory");

						const customerNotificationResult =
							await notificationService.sendCustomerQuoteNotification(
								{
									bookingRequest,
									selectedQuotes: createdQuotes,
									totalQuotes: quoteAnalysis.totalQuotes,
									bookingId: workflowRunId,
									customerEmail: customerEmail || "",
									customerName: workflowRun?.customerName || "",
								},
								workflowRunId,
								customerEmail || undefined,
								customerPhone || undefined,
							);

						if (customerNotificationResult.success) {
							console.log(`✅ Customer notifications sent successfully`);
						} else {
							console.warn(
								`⚠️ Customer notification issues: ${customerNotificationResult.errors.join(", ")}`,
							);
						}
					}
				} catch (error) {
					console.error("❌ Failed to send customer notifications:", error);
				}
			}
		}

		await updateWorkflowRunWithQuoteAnalysis(workflowRunId, quoteAnalysis);

		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Quotes", {
			quotesAnalyzed: quoteAnalysis.quoteAnalyses.length,
		});

		return {
			quoteAnalysis,
		};
	} catch (error) {
		console.error("❌ Failed to analyze responses and store data:", error);

		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"analysis_failed",
			"Quotes",
			5,
		);

		return {
			quoteAnalysis: null,
		};
	}
};
