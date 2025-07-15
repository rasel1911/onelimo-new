import { getServiceProviderById } from "@/db/queries/serviceProvider.queries";
import {
	getSelectedQuoteDetails,
	updateWorkflowWithConfirmationAnalysis,
} from "@/db/queries/workflow/workflowRun.queries";
import { BookingRequest } from "@/db/schema";
import { analyzeConfirmationMessage } from "@/lib/ai/services/confirmationAnalyzer/analyzer";
import { ConfirmationAnalyzerInput } from "@/lib/ai/services/confirmationAnalyzer/types";

import { WorkflowTrackingService } from "../services/workflowTrackingService";

/**
 * Run the user response step
 * @param data - The user response step data
 * @returns The result of the user response step
 */
export const runUserResponseStep = async (
	workflowRunId: string,
	bookingRequest: BookingRequest,
) => {
	try {
		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"processing_responses",
			"User Response",
			6,
		);

		const selectedQuoteDetails = await getSelectedQuoteDetails(workflowRunId);

		if (!selectedQuoteDetails) {
			throw new Error("No selected quote found for confirmation");
		}

		const provider = await getServiceProviderById(selectedQuoteDetails.providerId);

		if (!provider) {
			throw new Error("Provider not found for selected quote");
		}

		const confirmationInput: ConfirmationAnalyzerInput = {
			workflowRunId,
			userMessage: selectedQuoteDetails.message,
			userAction: selectedQuoteDetails.action,
			bookingContext: {
				bookingId: bookingRequest.requestCode,
				serviceName: bookingRequest.vehicleType,
				pickupDate: new Date(bookingRequest.pickupTime).toLocaleDateString(),
				pickupLocation: `${bookingRequest.pickupLocation.city}, ${bookingRequest.pickupLocation.postcode}`,
				dropoffLocation: `${bookingRequest.dropoffLocation.city}, ${bookingRequest.dropoffLocation.postcode}`,
				scheduledDate: new Date(bookingRequest.pickupTime).toLocaleDateString(),
				providerName: provider.name,
				amount: selectedQuoteDetails.amount,
			},
		};

		const confirmationAnalysis = await analyzeConfirmationMessage(confirmationInput);

		await updateWorkflowWithConfirmationAnalysis(workflowRunId, confirmationAnalysis);
		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "User Response", {
			confirmationAnalysis,
			selectedQuoteDetails,
			provider,
		});

		return {
			selectedQuoteAction: selectedQuoteDetails.action,
			confirmationAnalysis,
			selectedQuoteDetails,
			provider,
		};
	} catch (error) {
		console.error(`❌ Failed to process user response for ${workflowRunId}:`, error);
		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"user_response_failed",
			"User Response",
			6,
		);

		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "User Response", {
			error: error instanceof Error ? error.message : "Unknown error",
			failedAt: new Date().toISOString(),
		});

		return {
			selectedQuoteAction: null,
			confirmationAnalysis: null,
			selectedQuoteDetails: null,
			provider: null,
		};
	}
};
