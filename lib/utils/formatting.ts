export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

export const formatStatusText = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export const formatTime = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	}).format(date);
};

export const formatDuration = (minutes: number) => {
	const days = Math.floor(minutes / (24 * 60));
	const hours = Math.floor((minutes % (24 * 60)) / 60);
	const mins = minutes % 60;

	const parts = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (mins > 0) parts.push(`${mins}min`);

	return parts.join(" ") || "0min";
};

export const formatDayDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(date);
};

export const formatLocation = (location: { city: string; postcode: string }) => {
	return `${location.city}, ${location.postcode}`;
};

export const formatDateTime = (dateTime: string | Date | null): string => {
	if (!dateTime) return "N/A";
	const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
	return date.toLocaleString();
};
