export const BOOKING_STATUSES = {
	COMPLETED: "completed",
	IN_PROGRESS: "in-progress",
	PENDING: "pending",
	FAILED: "failed",
} as const;

export const WORKFLOW_STEP_NAMES = {
	REQUEST: "Request",
	MESSAGE: "Message",
	NOTIFICATION: "Notification",
	PROVIDERS: "Providers",
	QUOTES: "Quotes",
	USER_RESPONSE: "User Response",
	CONFIRMATION: "Confirmation",
	COMPLETE: "Complete",
} as const;

export const BOOKING_STATUS_COLORS = {
	[BOOKING_STATUSES.COMPLETED]: "bg-emerald-500",
	[BOOKING_STATUSES.IN_PROGRESS]: "bg-amber-500",
	[BOOKING_STATUSES.PENDING]: "bg-secondary dark:bg-secondary",
	[BOOKING_STATUSES.FAILED]: "bg-destructive dark:bg-destructive",
	default: "bg-secondary dark:bg-secondary",
} as const;

export const MODAL_TYPES = {
	BOOKING: "booking",
	MESSAGE: "message",
	NOTIFICATION: "notification",
	PROVIDERS: "providers",
	QUOTES: "quotes",
	USER_RESPONSE: "user_response",
	CONFIRMATION: "confirmation",
	COMPLETE: "complete",
} as const;

export const DATE_FORMAT_OPTIONS = {
	year: "numeric" as const,
	month: "long" as const,
	day: "numeric" as const,
	hour: "numeric" as const,
	minute: "2-digit" as const,
	hour12: true as const,
};

export const CURRENCY_FORMAT_OPTIONS = {
	style: "currency" as const,
	currency: "USD" as const,
};
