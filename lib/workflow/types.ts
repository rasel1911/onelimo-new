import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { ServiceProvider } from "@/db/schema/serviceProvider.schema";
import { User } from "@/db/schema/user.schema";

// Workflow payload types
export interface BookingWorkflowPayload {
	bookingRequestId: string;
	bookingRequest: BookingRequest;
	user: User;
}

export interface ServiceProviderResponse {
	serviceProviderId: string;
	response: "accepted" | "declined" | "no_response";
	responseTime: Date;
	estimatedPrice?: number;
	notes?: string;
}

export interface WorkflowStepResult {
	success: boolean;
	data?: any;
	error?: string;
	timestamp: Date;
}

// Service provider matching criteria
export interface ServiceProviderMatch {
	serviceProvider: ServiceProvider;
	matchScore: number;
	distance?: number;
	availability: boolean;
}

// Workflow status tracking
export interface WorkflowStatus {
	workflowRunId: string;
	bookingRequestId: string;
	status:
		| "pending"
		| "finding_providers"
		| "sending_notifications"
		| "waiting_responses"
		| "completed"
		| "failed";
	currentStep: string;
	providersContacted: string[];
	responses: ServiceProviderResponse[];
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkflowConfig {
	responseTimeoutMinutes: number;
	maxProvidersToContact: number;
	retryAttempts: number;
	fallbackTimeoutMinutes: number;
	responseCheckIntervalMinutes: number;
	maxResponseChecks: number;
}
