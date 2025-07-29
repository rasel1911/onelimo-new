/**
 * Format a date
 * @param dateString - The date to format
 * @returns The formatted date
 */
export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

/**
 * Format a status text
 * @param status - The status to format
 * @returns The formatted status text
 */
export const formatStatusText = (status: string) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

/**
 * Format a time
 * @param dateString - The date to format
 * @returns The formatted time
 */
export const formatTime = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	}).format(date);
};

/**
 * Format a duration
 * @param minutes - The duration in minutes
 * @returns The formatted duration
 */
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

/**
 * Format a day and date
 * @param dateString - The date to format
 * @returns The formatted day and date
 */
export const formatDayDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(date);
};

/**
 * Format a location
 * @param location - The location to format
 * @returns The formatted location
 */
export const formatLocation = (location: { city: string; postcode: string }) => {
	return `${location.city}, ${location.postcode}`;
};

/**
 * Format a date and time
 * @param dateTime - The date and time to format
 * @returns The formatted date and time
 */
export const formatDateTime = (dateTime: string | Date | null): string => {
	if (!dateTime) return "N/A";
	const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
	return date.toLocaleString();
};

/**
 * Parse custom service types from a string
 * @param input - The input string to parse
 * @param existingCustomTypes - The existing custom types
 * @param standardTypes - The standard types
 * @returns The parsed custom service types
 */
export const parseCustomServiceTypes = (
	input: string,
	existingCustomTypes: string[],
	standardTypes: string[],
): string[] => {
	if (!input.trim()) return [];

	const candidates = input
		.split(/[,\t\n]/)
		.map((t) => t.trim().toLowerCase().replace(/\s+/g, "_"))
		.filter(Boolean);

	const unique = Array.from(new Set(candidates));

	return unique.filter(
		(type) => !existingCustomTypes.includes(type) && !standardTypes.includes(type),
	);
};
