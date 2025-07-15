import { ServiceProvider, WorkflowNotification } from "@/db/schema";

export const CONTACT_STATUS = "contacted" as const;
export const RESPONSE_STATUS = "pending" as const;

export interface ProviderContactData {
	workflowRunId: string;
	serviceProviderId: string;
	contactStatus: typeof CONTACT_STATUS;
	responseStatus: typeof RESPONSE_STATUS;
}

export interface NotificationRecord {
	workflowRunId: string;
	workflowProviderId: string;
	type: string;
	recipient: string;
	status: "sent" | "failed";
	templateUsed: string;
	messageId: string;
	errorCode?: string;
	errorMessage?: string;
	sentAt: Date;
	retryCount: number;
	maxRetries: number;
	hasResponse: boolean;
}

export interface StoreContactsResult {
	providers: any[];
	notifications: NotificationRecord[];
}

/**
 * Types for the API response for the notification details modal
 */
export interface ProviderNotification {
	notification: WorkflowNotification;
	provider: ServiceProvider | null;
}
export interface TransformedNotification {
	notification: {
		id: string;
		type: string;
		recipient: string;
		status: string;
		sentAt: string | null;
		errorMessage: string | null;
		templateUsed: string | null;
		retryCount: number;
		hasResponse: boolean;
		responseAt: string | null;
	};
	provider: {
		id: string;
		name: string;
		email: string;
		phone?: string;
		status: string;
		serviceType: string[];
		areaCovered: string[];
		reputation: number;
		responseTime: number;
		role: string;
		createdAt?: string;
		updatedAt?: string;
	} | null;
}

export interface NotificationSummary {
	total: number;
	sent: number;
	failed: number;
	successRate: number;
	status?: "sent" | "failed" | "pending";
}

export interface ResponseSummary {
	total: number;
	email: NotificationSummary;
	sms: NotificationSummary;
	providers: number;
}

// Modal-specific interfaces
export interface NotificationDetailsModalProps {
	isOpen: boolean;
	onCloseAction: () => void;
	data: any;
}
