export const NOTIFICATION_TYPES = {
	EMAIL: "email",
	SMS: "sms",
} as const;

export const NOTIFICATION_STATUSES = {
	SENT: "sent",
	DELIVERED: "delivered",
	FAILED: "failed",
	PENDING: "pending",
} as const;

export const PROVIDER_STATUSES = {
	ACTIVE: "active",
	PENDING: "pending",
	INACTIVE: "inactive",
} as const;

export const STATUS_COLORS = {
	[NOTIFICATION_STATUSES.SENT]: "bg-emerald-500",
	[NOTIFICATION_STATUSES.DELIVERED]: "bg-emerald-500",
	[NOTIFICATION_STATUSES.FAILED]: "bg-red-500",
	[NOTIFICATION_STATUSES.PENDING]: "bg-amber-500",
	default: "bg-slate-500",
} as const;

export const PROVIDER_STATUS_COLORS = {
	[PROVIDER_STATUSES.ACTIVE]: "bg-emerald-500",
	[PROVIDER_STATUSES.PENDING]: "bg-amber-500",
	[PROVIDER_STATUSES.INACTIVE]: "bg-slate-500",
	default: "bg-slate-500",
} as const;

export const SUCCESS_STATUSES = [NOTIFICATION_STATUSES.SENT, NOTIFICATION_STATUSES.DELIVERED];
