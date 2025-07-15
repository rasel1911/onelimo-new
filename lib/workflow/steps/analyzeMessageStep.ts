import { updateWorkflowWithAnalysis } from "@/db/queries/workflow/workflowRun.queries";
import { updateMessageStep, updateStepDetails } from "@/db/queries/workflow/workflowStep.queries";
import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { BookingAnalysis } from "@/lib/ai/services/bookingAnalyzer";

import { WorkflowTrackingService } from "../services/workflowTrackingService";

/**
 * Stores the enhanced message and analysis in the database
 * @param workflowRunId - The ID of the workflow run
 * @param originalMessage - The original message from the booking request
 * @param enhancedMessage - The enhanced message from the AI
 * @param analysis - The analysis of the booking request
 */
export const storeAnalyzedMessage = async (
	workflowRunId: string,
	originalMessage: string,
	enhancedMessage: string,
	analysis: any,
) => {
	try {
		await updateMessageStep(workflowRunId, enhancedMessage);
		await updateWorkflowWithAnalysis(workflowRunId, analysis);

		// Store details for UI
		const stepDetails = {
			originalMessage,
			enhancedMessage,
			original: originalMessage,
			improved: enhancedMessage,
			analysis,
		};

		await updateStepDetails(workflowRunId, "Message", stepDetails);
	} catch (error) {
		console.error("Failed to store enhanced message:", error);
		throw error;
	}
};

/**
 * Runs the analyze message step
 * @param workflowRunId - The ID of the workflow run
 * @param bookingRequest - The booking request
 * @param analysis - The analysis of the booking request
 */
export const runAnalyzeMessageStep = async (
	workflowRunId: string,
	bookingRequest: BookingRequest,
	analysis: BookingAnalysis,
) => {
	await WorkflowTrackingService.updateWorkflowStatusAndStep(
		workflowRunId,
		"analyzing",
		"Message",
		2,
	);
	await storeAnalyzedMessage(
		workflowRunId,
		bookingRequest.specialRequests ||
			`${bookingRequest.vehicleType} from ${bookingRequest.pickupLocation.city} to ${bookingRequest.dropoffLocation.city}`,
		analysis.refinedMessage,
		analysis,
	);

	await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Message");

	return { enhancedMessage: analysis.refinedMessage };
};
