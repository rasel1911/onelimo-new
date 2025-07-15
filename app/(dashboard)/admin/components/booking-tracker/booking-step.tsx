import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MODAL_TYPES, WORKFLOW_STEP_NAMES } from "@/lib/workflow/constants/booking-tracker";
import { BookingStepProps } from "@/lib/workflow/types/booking-tracker";
import { formatTimestamp, getStatusColor } from "@/lib/workflow/utils/booking-tracker-utils";

import { StatusBadge } from "./status-badge";
import {
	NotificationStepContent,
	ProvidersStepContent,
	QuotesStepContent,
	UserResponseStepContent,
	ConfirmationStepContent,
	CompleteStepContent,
} from "./step-content";
import { StepIcon } from "./step-icon";

export function BookingStep({ step, selectedBooking, onModalOpen }: BookingStepProps) {
	const handleStepClick = () => {
		if (step.status === "pending") return;

		switch (step.name) {
			case WORKFLOW_STEP_NAMES.REQUEST:
				if (step.details || selectedBooking.rawData) {
					onModalOpen(MODAL_TYPES.BOOKING, {
						message:
							step.details?.originalMessage || step.details?.message || "Booking request details",
						contact:
							step.details?.customerContact ||
							step.details?.contact ||
							selectedBooking.customer ||
							"Contact information",
						bookingRequest: selectedBooking.bookingRequest,
					});
				}
				break;
			case WORKFLOW_STEP_NAMES.MESSAGE:
				if (step.details || selectedBooking.rawData) {
					onModalOpen(MODAL_TYPES.MESSAGE, {
						original: step.details?.originalMessage || step.details?.original || "Original message",
						improved: step.details?.enhancedMessage || step.details?.improved || "Enhanced message",
						analysis: step.details?.analysis || null,
						step: step,
					});
				}
				break;
			case WORKFLOW_STEP_NAMES.NOTIFICATION:
				if (step.details) {
					onModalOpen(MODAL_TYPES.NOTIFICATION, step.details);
				} else {
					onModalOpen(MODAL_TYPES.NOTIFICATION, {
						email: {
							status: "unknown",
							recipients: 0,
							total: 0,
							failed: 0,
							timestamp: step.timestamp || new Date().toISOString(),
						},
						sms: {
							status: "unknown",
							recipients: 0,
							total: 0,
							failed: 0,
							timestamp: step.timestamp || new Date().toISOString(),
						},
						totalProviders: 0,
						totalNotifications: 0,
						workflowRunId: null,
					});
				}
				break;
			case WORKFLOW_STEP_NAMES.PROVIDERS:
				step.providers && onModalOpen(MODAL_TYPES.PROVIDERS, step.providers);
				break;
			case WORKFLOW_STEP_NAMES.QUOTES:
				onModalOpen(MODAL_TYPES.QUOTES, {
					quotes: step.quotes || [],
					workflowRunId: selectedBooking.rawData?.workflowRun?.workflowRunId,
				});
				break;
			case WORKFLOW_STEP_NAMES.USER_RESPONSE:
				onModalOpen(MODAL_TYPES.USER_RESPONSE, {
					confirmationAnalysis:
						(selectedBooking.rawData?.workflowRun as any)?.confirmationAnalysis || null,
					selectedQuoteDetails: step.details?.selectedQuoteDetails || null,
					provider: step.details?.provider || null,
				});
				break;
			case WORKFLOW_STEP_NAMES.CONFIRMATION:
				onModalOpen(MODAL_TYPES.CONFIRMATION, {
					providerNotificationResult: step.details?.providerNotifications || null,
					customerNotificationResult: step.details?.customerNotifications || null,
					provider: step.details?.provider || null,
					selectedQuoteDetails: step.details?.selectedQuoteDetails || null,
					bookingId: selectedBooking.bookingRequest?.requestCode || selectedBooking.bookingId,
					urgent: step.details?.urgent || false,
				});
				break;
			case WORKFLOW_STEP_NAMES.COMPLETE:
				onModalOpen(MODAL_TYPES.COMPLETE, {
					workflowRun: selectedBooking.rawData?.workflowRun || null,
					bookingRequest: selectedBooking.bookingRequest || null,
					providerNotifications: step.details?.providerNotifications || null,
					customerNotifications: step.details?.customerNotifications || null,
					bookingId: selectedBooking.bookingRequest?.requestCode || selectedBooking.bookingId,
					completedAt: step.completedAt || step.timestamp,
				});
				break;
			default:
				break;
		}
	};

	return (
		<div className={`relative flex ${step.timestamp ? "items-start" : "items-center"}`}>
			{/* Step indicator */}
			<div
				className={`absolute left-0 flex size-12 items-center justify-center rounded-full border-4 border-background ${getStatusColor(step.status)}`}
			>
				<div className="text-white">
					<StepIcon stepName={step.name} />
				</div>
			</div>

			{/* Step content */}
			<div className="ml-16 flex-1">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-semibold">{step.name}</h4>
						{step.timestamp ? (
							<p className="text-xs text-muted-foreground">{formatTimestamp(step.timestamp)}</p>
						) : (
							<p className="text-xs text-muted-foreground">Waiting to be processed</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<StatusBadge status={step.status} />

						{/* Action button */}
						{/* step.status !== "pending"  */}
						{true && step.name !== WORKFLOW_STEP_NAMES.COMPLETE && (
							<Button variant="ghost" size="icon" onClick={handleStepClick}>
								<ExternalLink className="size-4" />
							</Button>
						)}
					</div>
				</div>

				{/* Step-specific content */}
				{step.name === WORKFLOW_STEP_NAMES.NOTIFICATION && (
					<NotificationStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{step.name === WORKFLOW_STEP_NAMES.PROVIDERS && (
					<ProvidersStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{step.name === WORKFLOW_STEP_NAMES.QUOTES && (
					<QuotesStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{step.name === WORKFLOW_STEP_NAMES.USER_RESPONSE && (
					<UserResponseStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{step.name === WORKFLOW_STEP_NAMES.CONFIRMATION && (
					<ConfirmationStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{step.name === WORKFLOW_STEP_NAMES.COMPLETE && (
					<CompleteStepContent
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				)}

				{/* Wait time */}
				{step.waitTime && (
					<div className="mt-2">
						<p className="text-sm text-muted-foreground">⏰ {step.waitTime}</p>
					</div>
				)}
			</div>
		</div>
	);
}
