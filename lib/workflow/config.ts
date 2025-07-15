import { WorkflowConfig } from "./types";

export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
	responseTimeoutMinutes: 30, // Wait 30 minutes for initial responses
	maxProvidersToContact: 5, // Contact up to 5 providers initially
	retryAttempts: 3, // Retry failed operations 3 times
	fallbackTimeoutMinutes: 60, // Wait 1 hour total before fallback
	responseCheckIntervalMinutes: 10, // Check for responses every 10 minutes
	maxResponseChecks: 3, // Check responses 3 times (10, 20, 30 minutes)
};

export const WORKFLOW_STEPS = {
	ANALYZE_BOOKING: "analyze-booking-request",
	FIND_PROVIDERS: "find-service-providers",
	SEND_NOTIFICATIONS: "send-provider-notifications",
	WAIT_FOR_RESPONSES: "wait-for-provider-responses",
	CHECK_RESPONSES: "check-provider-responses",
	ANALYZE_RESPONSES: "analyze-provider-responses",
	SEND_CUSTOMER_SUMMARY: "send-customer-summary",
	WAIT_USER_CONFIRMATION: "wait-user-confirmation",
	FINALIZE_BOOKING: "finalize-booking",
	SEND_CONFIRMATIONS: "send-booking-confirmations",
} as const;

export const WORKFLOW_TIMEOUTS = {
	PROVIDER_RESPONSE: 30 * 60, // 30 minutes in seconds
	RESPONSE_CHECK_INTERVAL: 10 * 60, // 10 minutes in seconds
	USER_CONFIRMATION: 24 * 60 * 60, // 24 hours for user confirmation
	FALLBACK_TIMEOUT: 60 * 60, // 1 hour in seconds
	RETRY_DELAY: 5 * 60, // 5 minutes in seconds
} as const;
