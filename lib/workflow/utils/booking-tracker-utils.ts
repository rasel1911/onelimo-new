import {
	BOOKING_STATUSES,
	BOOKING_STATUS_COLORS,
	DATE_FORMAT_OPTIONS,
	CURRENCY_FORMAT_OPTIONS,
} from "@/lib/workflow/constants/booking-tracker";

export const getStatusColor = (status: string): string => {
	const normalizedStatus = status.toLowerCase();
	return (
		BOOKING_STATUS_COLORS[normalizedStatus as keyof typeof BOOKING_STATUS_COLORS] ||
		BOOKING_STATUS_COLORS.default
	);
};

export const formatStatusText = (status: string): string => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export const formatTimestamp = (timestamp: string): string => {
	try {
		return new Date(timestamp).toLocaleString("en-US", DATE_FORMAT_OPTIONS);
	} catch {
		return timestamp;
	}
};

export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-US", CURRENCY_FORMAT_OPTIONS).format(amount / 100); // Amount is in cents
};

export const isCompletedStatus = (status: string): boolean => {
	return status === BOOKING_STATUSES.COMPLETED || status === "Completed";
};

export const getTabsGridClass = (count: number): string => {
	if (count === 1) return "grid grid-cols-1";
	if (count === 2) return "grid grid-cols-2";
	return "grid grid-cols-3";
};

export const calculateTabsWidth = (count: number): string => {
	return `w-[${count * 120}px]`;
};
