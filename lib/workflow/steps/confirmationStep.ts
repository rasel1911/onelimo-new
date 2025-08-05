import { getWorkflowRunByWorkflowRunId } from "@/db/queries/workflow/workflowRun.queries";
import { formatLocation } from "@/lib/utils/formatting";

import { notificationService } from "../communication/communication-factory";
import { WorkflowTrackingService } from "../services/workflowTrackingService";
import { ConfirmationStepData, ConfirmationStepResult } from "../types/confirmation";
import {
	formatBookingDate,
	formatBookingTime,
	formatDuration,
	generateGoogleCalendarUrl,
	createCalendarEventData,
} from "../utils/confirmation-utils";

/**
 * Run the confirmation step - analyze customer message and send confirmations
 * @param data - The confirmation step data
 * @returns The result of the confirmation step
 */
export const runConfirmationStep = async (
	data: ConfirmationStepData,
): Promise<ConfirmationStepResult> => {
	const {
		workflowRunId,
		bookingRequest,
		confirmationAnalysis,
		selectedQuoteDetails,
		provider,
		urgent = false,
	} = data;

	console.log(`✅ [STEP 7]: Processing confirmation for ${workflowRunId}`);

	try {
		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"processing_confirmation",
			"Confirmation",
			7,
		);

		const workflowRun = await getWorkflowRunByWorkflowRunId(workflowRunId);

		if (!workflowRun) {
			throw new Error("Workflow run not found");
		}

		const pickupTime = new Date(bookingRequest.pickupTime);
		const dropoffTime = new Date(bookingRequest.estimatedDropoffTime);

		const bookingDate = formatBookingDate(pickupTime);
		const bookingTimeStr = formatBookingTime(pickupTime);
		const pickupTimeStr = formatBookingTime(pickupTime);
		const dropoffTimeStr = formatBookingTime(dropoffTime);
		const estimatedDuration = formatDuration(bookingRequest.estimatedDuration);

		const pickupAddress = formatLocation(bookingRequest.pickupLocation);
		const dropoffAddress = formatLocation(bookingRequest.dropoffLocation);

		const customerName = workflowRun.customerName || bookingRequest.customerName;
		const calendarEventData = createCalendarEventData(
			bookingRequest,
			selectedQuoteDetails,
			customerName,
		);
		const googleCalendarUrl = generateGoogleCalendarUrl(calendarEventData);

		const isUrgent = urgent || confirmationAnalysis.urgency === "high";
		const customerContact = {
			name: workflowRun.customerName || bookingRequest.customerName,
			email: workflowRun.customerEmail || "",
			phone: workflowRun.customerPhone || "",
		};

		console.log(`📧 Sending provider confirmation to ${provider.name}`);
		const providerNotificationResult = await notificationService.sendProviderConfirmation({
			providerName: provider.name,
			providerEmail: provider.email,
			providerPhone: provider.phone,
			providerId: provider.id,

			customerName: customerContact.name,
			customerEmail: customerContact.email,
			customerPhone: customerContact.phone,

			bookingId: bookingRequest.requestCode,
			serviceType: bookingRequest.vehicleType,
			bookingDate,
			bookingTime: bookingTimeStr,
			estimatedDuration,
			pickupAddress,
			pickupTime: pickupTimeStr,
			dropoffAddress,
			dropoffTime: dropoffTimeStr,
			vehicleType: bookingRequest.vehicleType,
			passengerCount: bookingRequest.passengers,
			confirmedAmount: selectedQuoteDetails.amount,
			specialNotes: bookingRequest.specialRequests ?? undefined,
			googleCalendarUrl,
			companyName: "Onelimo",
			supportEmail: process.env.SUPPORT_EMAIL,
			urgent: isUrgent,
		});

		console.log(`📧 Sending customer confirmation to ${customerContact.name}`);
		const customerNotificationResult = await notificationService.sendCustomerConfirmation({
			customerName: customerContact.name,
			customerEmail: customerContact.email,
			customerPhone: workflowRun.customerPhone ?? undefined,
			customerId: workflowRun.id,

			providerName: provider.name,
			providerPhone: provider.phone || "",
			providerEmail: provider.email,

			// Booking details
			bookingId: bookingRequest.requestCode,
			serviceType: bookingRequest.vehicleType,
			bookingDate,
			bookingTime: bookingTimeStr,
			estimatedDuration,
			pickupAddress,
			pickupTime: pickupTimeStr,
			dropoffAddress,
			dropoffTime: dropoffTimeStr,
			vehicleType: bookingRequest.vehicleType,
			passengerCount: bookingRequest.passengers,
			confirmedAmount: selectedQuoteDetails.amount,
			specialNotes: bookingRequest.specialRequests ?? undefined,

			googleCalendarUrl,
			companyName: "Onelimo",
			supportEmail: process.env.SUPPORT_EMAIL,
			urgent: isUrgent,
		});

		const stepDetails = {
			providerNotifications: {
				success: providerNotificationResult.success,
				resultsCount: providerNotificationResult.results.length,
				errors: providerNotificationResult.errors,
			},
			customerNotifications: {
				success: customerNotificationResult.success,
				resultsCount: customerNotificationResult.results.length,
				errors: customerNotificationResult.errors,
			},
		};

		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Confirmation", stepDetails);

		console.log(`✅ Confirmation step completed successfully for ${workflowRunId}`);

		return {
			success: true,
			providerNotificationResult,
			customerNotificationResult,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(`❌ Failed to process confirmation for ${workflowRunId}:`, errorMessage);

		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"confirmation_failed",
			"Confirmation",
			7,
		);

		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Confirmation", {
			error: errorMessage,
			failedAt: new Date().toISOString(),
			provider: provider?.name || "Unknown",
			bookingId: bookingRequest?.requestCode || "Unknown",
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
};
