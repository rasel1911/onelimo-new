import { getBookingRequestById } from "@/db/queries/bookingRequest.queries";
import { updateRequestStep, updateStepDetails } from "@/db/queries/workflow/workflowStep.queries";
import { User } from "@/db/schema/user.schema";

import { WorkflowTrackingService } from "../services/workflowTrackingService";

/**
 * Stores the booking request details in the database
 * @param workflowRunId - The ID of the workflow run
 * @param originalMessage - The original message from the booking request
 * @param customerContact - The contact information of the customer
 */
export const storeBookingRequestDetails = async (
	workflowRunId: string,
	originalMessage: string,
	customerContact: string,
) => {
	try {
		await updateRequestStep(workflowRunId, originalMessage, customerContact);

		const stepDetails = {
			originalMessage,
			customerContact,
			message: originalMessage,
			contact: customerContact,
		};

		await updateStepDetails(workflowRunId, "Request", stepDetails);
	} catch (error) {
		console.error("Failed to store request details:", error);
		throw error;
	}
};

/**
 * Runs the booking request step
 * @param workflowRunId - The ID of the workflow run
 * @param bookingRequestId - The ID of the booking request
 * @param user - The user who made the booking request
 */
export const runBookingRequestStep = async (
	workflowRunId: string,
	bookingRequestId: string,
	user: User,
) => {
	const bookingRequest = await getBookingRequestById(bookingRequestId);
	if (!bookingRequest) {
		throw new Error(`Booking request ${bookingRequestId} not found`);
	}

	await storeBookingRequestDetails(
		workflowRunId,
		bookingRequest.specialRequests ||
			`${bookingRequest.vehicleType} from ${bookingRequest.pickupLocation.city} to ${bookingRequest.dropoffLocation.city}`,
		user.name,
	);

	await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Request");

	return { bookingRequest };
};
