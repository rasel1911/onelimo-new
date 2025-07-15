import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { ServiceProvider } from "@/db/schema/serviceProvider.schema";
import { ConfirmationAnalysis, WorkflowRun } from "@/db/schema/workflow/workflowRun.schema";

import { NotificationResult } from "./communication";

// ================================ //
// CONFIRMATION STEP TYPES
// ================================ //

export interface ConfirmationStepData {
	workflowRunId: string;
	bookingRequest: BookingRequest;
	confirmationAnalysis: ConfirmationAnalysis;
	selectedQuoteDetails: SelectedQuoteDetails;
	provider: ServiceProvider;
	urgent?: boolean;
}

export interface WorkflowRunData {
	id: string;
	customerName?: string | null;
	customerEmail?: string | null;
	customerPhone?: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SelectedQuoteDetails {
	quoteId: string;
	providerId: string;
	amount: number;
	message?: string | null;
}

export interface ConfirmationStepResult {
	success: boolean;
	confirmationAnalysis?: ConfirmationAnalysis;
	providerNotificationResult?: ConfirmationNotificationResult;
	customerNotificationResult?: ConfirmationNotificationResult;
	error?: string;
}

export interface ConfirmationNotificationResult {
	success: boolean;
	results: NotificationResult[];
	errors: string[];
}

// ================================ //
// CONFIRMATION NOTIFICATION TYPES
// ================================ //

export interface BaseConfirmationData {
	bookingId: string;
	serviceType: string;
	bookingDate: string;
	bookingTime: string;
	estimatedDuration: string;
	pickupAddress: string;
	pickupTime: string;
	dropoffAddress: string;
	dropoffTime: string;
	vehicleType: string;
	passengerCount: number;
	confirmedAmount: number;
	specialNotes?: string;
	googleCalendarUrl: string;
	companyName: string;
	supportEmail?: string;
	urgent?: boolean;
}

export interface ProviderConfirmationData extends BaseConfirmationData {
	providerName: string;
	providerEmail: string;
	providerPhone?: string;
	providerId: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
}

export interface CustomerConfirmationData extends BaseConfirmationData {
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	customerId: string;
	providerName: string;
	providerPhone: string;
	providerEmail: string;
	providerRating?: number;
}

// ================================ //
// GOOGLE CALENDAR TYPES
// ================================ //

export interface CalendarEventData {
	title: string;
	startTime: string;
	endTime: string;
	description: string;
	location: string;
}

// ================================ //
// VALIDATION TYPES
// ================================ //

export interface ConfirmationValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

export interface ConfirmationRequiredFields {
	workflowRunId: boolean;
	customerMessage: boolean;
	selectedQuote: boolean;
	providerDetails: boolean;
	customerContact: boolean;
}

export interface ConfirmationSMSData {
	customerName: string;
	providerName: string;
	bookingDate: string;
	bookingTime: string;
	pickupAddress: string;
	dropoffAddress: string;
	vehicleType: string;
	confirmedAmount: number;
	bookingId: string;
	providerId: string;
}
