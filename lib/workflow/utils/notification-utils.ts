import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

import {
	STATUS_COLORS,
	PROVIDER_STATUS_COLORS,
	NOTIFICATION_STATUSES,
} from "@/lib/workflow/constants/notification";

export const getStatusColor = (status: string) => {
	const normalizedStatus = status.toLowerCase();
	return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

export const getProviderStatusColor = (status: string) => {
	const normalizedStatus = status?.toLowerCase();
	return (
		PROVIDER_STATUS_COLORS[normalizedStatus as keyof typeof PROVIDER_STATUS_COLORS] ||
		PROVIDER_STATUS_COLORS.default
	);
};

export const getStatusIcon = (status: string) => {
	const normalizedStatus = status.toLowerCase();
	switch (normalizedStatus) {
		case NOTIFICATION_STATUSES.SENT:
		case NOTIFICATION_STATUSES.DELIVERED:
			return CheckCircle;
		case NOTIFICATION_STATUSES.FAILED:
			return AlertTriangle;
		case NOTIFICATION_STATUSES.PENDING:
		default:
			return Clock;
	}
};

export const formatServiceTypes = (serviceTypes: string[] | undefined): string => {
	if (!serviceTypes || serviceTypes.length === 0) return "Not specified";
	return serviceTypes
		.map((type) =>
			type
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
		)
		.join(", ");
};

export const getReputationStars = (reputation: number | undefined): number => {
	if (!reputation) return 0;
	return Math.min(Math.max(Math.round(reputation / 20), 0), 5); // Convert to 0-5 scale
};

export const formatDateTime = (dateTime: string | Date | null): string => {
	if (!dateTime) return "N/A";
	const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
	return date.toLocaleString();
};

export const calculateSuccessRate = (sent: number, total: number): number => {
	return total > 0 ? Math.round((sent / total) * 100) : 0;
};
