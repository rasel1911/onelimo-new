import { BookingRequest } from "@/db/schema/bookingRequest.schema";

// Types for workflow tracking data
export interface WorkflowStep {
	id: number;
	name: string;
	status: "pending" | "in-progress" | "completed" | "failed";
	timestamp?: string;
	details?: Record<string, any>;
	providers?: WorkflowProvider[];
	quotes?: WorkflowQuote[];
	waitTime?: string;
	completedAt?: string;
}

export interface WorkflowProvider {
	id: string;
	providerId: string;
	providerName: string;
	providerEmail?: string;
	providerPhone?: string;
	rating?: number;
	distance?: string;
	contactStatus: string;
	hasResponded: boolean;
	responseStatus?: string;
	responseTime?: string;
	responseNotes?: string;
	refinedResponse?: string;
	hasQuoted: boolean;
	quoteAmount?: number;
	quoteTime?: string;
	quoteNotes?: string;
	refinedQuote?: string;
	estimatedTime?: string;
}

export interface WorkflowQuote {
	id: string;
	quoteId: string;
	providerId: string;
	providerName: string;
	status: "accepted" | "declined" | "pending";
	amount?: number;
	estimatedTime?: string;
	rating?: number;
	responseTime: string;
	notes?: string;
	reason?: string;
	isSelected: boolean;
}

export interface WorkflowNotification {
	id: string;
	type: "email" | "sms" | "push";
	recipient: string;
	status: string;
	sentAt?: string;
	deliveredAt?: string;
	hasResponse: boolean;
}

export interface WorkflowStatistics {
	providers: {
		totalContacted: number;
		totalResponded: number;
		totalQuoted: number;
		responseRate: number;
		quoteRate: number;
	};
	quotes: {
		totalQuotes: number;
		acceptedQuotes: number;
		declinedQuotes: number;
		averageAmount: number;
		lowestAmount: number;
		highestAmount: number;
		acceptanceRate: number;
	};
	notifications: {
		totalNotifications: number;
		emailNotifications: number;
		smsNotifications: number;
		sentCount: number;
		deliveredCount: number;
		openedCount: number;
		clickedCount: number;
		failedCount: number;
		responseCount: number;
		deliveryRate: number;
		openRate: number;
		clickRate: number;
		responseRate: number;
	};
}

export interface WorkflowRun {
	id: string;
	workflowRunId: string;
	bookingRequestId: string;
	userId: string;
	status:
		| "analyzing"
		| "sending_notifications"
		| "waiting_responses"
		| "processing_responses"
		| "completed"
		| "failed";
	currentStep:
		| "Request"
		| "Message"
		| "Notification"
		| "Providers"
		| "Quotes"
		| "User Response"
		| "Confirmation"
		| "Complete";
	currentStepNumber: number;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
	startedAt: string;
	completedAt?: string;
}

export interface WorkflowTrackingData {
	id: string; // booking request ID
	bookingId: string;
	customer: string;
	service: string; // service type from booking request
	location: string; // pickup location from booking request
	date: string;
	status: string;
	currentStep: number;
	steps: WorkflowStep[];
	bookingRequest?: BookingRequest;
	rawData: {
		workflowRun: WorkflowRun;
		steps: any[];
		providers: WorkflowProvider[];
		quotes: WorkflowQuote[];
		notifications: WorkflowNotification[];
		statistics: WorkflowStatistics;
	};
}

export interface WorkflowTrackingResponse {
	workflowTracking: WorkflowTrackingData[];
}
