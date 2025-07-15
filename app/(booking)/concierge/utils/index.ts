import { APP_CONFIG, PATTERNS, TIME_FORMATS } from "../constants";

/**
 * @description
 * Generates a unique message ID
 * @returns The generated message ID.
 */
export const generateMessageId = (): string =>
	`OLBK_MSG_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * @description
 * Checks if a location is within service area
 * @param cityName - The name of the city to check.
 * @param validCities - The list of valid cities.
 * @returns True if the location is serviced, false otherwise.
 */
export const isLocationServiced = (cityName: string, validCities: readonly string[]): boolean =>
	validCities.some(
		(city) =>
			city.toLowerCase().includes(cityName.toLowerCase()) ||
			cityName.toLowerCase().includes(city.toLowerCase()),
	);

/**
 * @description
 * Formats a UK postcode properly
 * @param postcode - The postcode to format.
 * @returns The formatted postcode.
 */
export const formatPostcode = (postcode: string): string => {
	const cleaned = postcode.replace(/\s/g, "").toUpperCase();
	return cleaned.slice(0, -3) + " " + cleaned.slice(-3);
};

/**
 * @description
 * Validates UK postcode format
 * @param postcode - The postcode to validate.
 * @returns True if the postcode is valid, false otherwise.
 */
export const isValidUKPostcode = (postcode: string): boolean =>
	PATTERNS.UK_POSTCODE.test(postcode.replace(/\s/g, ""));

/**
 * @description
 * Checks if a date is within acceptable booking range
 * @param date - The date to check.
 * @returns An object with isValid and reason properties.
 */
export const isValidBookingTime = (date: Date): { isValid: boolean; reason?: string } => {
	const now = new Date();
	const minimumFutureTime = new Date(
		now.getTime() + APP_CONFIG.MINIMUM_FUTURE_TIME_MINUTES * 60 * 1000,
	);
	const oneYearFromNow = new Date();
	oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + APP_CONFIG.MAX_FUTURE_TIME_YEARS);

	if (date <= minimumFutureTime) {
		return { isValid: false, reason: "too_early" };
	}

	if (date > oneYearFromNow) {
		return { isValid: false, reason: "too_far" };
	}

	return { isValid: true };
};

/**
 * @description
 * Formats a date according to UK standards
 * @param date - The date to format.
 * @returns The formatted date.
 */
export const formatDate = (date: Date): string =>
	date.toLocaleDateString(TIME_FORMATS.LOCALE, TIME_FORMATS.DATE_OPTIONS);

/**
 * @description
 * Formats time according to UK standards
 * @param date - The time to format.
 * @returns The formatted time.
 */
export const formatTime = (date: Date): string =>
	date.toLocaleTimeString(TIME_FORMATS.LOCALE, TIME_FORMATS.TIME_OPTIONS);

/**
 * @description
 * Formats date and time together
 * @param dateString - The date and time to format.
 * @returns The formatted date and time.
 */
export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);
	return formatDate(date);
};

/**
 * @description
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * @description
 * Checks if two arrays are equal (shallow comparison)
 * @param a - The first array.
 * @param b - The second array.
 * @returns True if the arrays are equal, false otherwise.
 */
export const arraysEqual = <T>(a: T[], b: T[]): boolean =>
	a.length === b.length && a.every((val, i) => val === b[i]);

/**
 * @description
 * Debounces a function call
 * @param func - The function to debounce.
 * @param wait - The time to wait before calling the function.
 * @returns The debounced function.
 */
export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

/**
 * @description
 * Throttles a function call
 * @param func - The function to throttle.
 * @param limit - The time to wait before calling the function.
 * @returns The throttled function.
 */
export const throttle = <T extends (...args: any[]) => any>(
	func: T,
	limit: number,
): ((...args: Parameters<T>) => void) => {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
};

/**
 * @description
 * Safely gets a nested object property
 * @param obj - The object to get the property from.
 * @param path - The path to the property.
 * @param defaultValue - The default value to return if the property is not found.
 * @returns The property value or the default value.
 */
export const safeGet = <T>(obj: any, path: string, defaultValue?: T): T => {
	const keys = path.split(".");
	let current = obj;

	for (const key of keys) {
		if (current?.[key] === undefined) {
			return defaultValue as T;
		}
		current = current[key];
	}

	return current as T;
};

/**
 * @description
 * Checks if an object is empty
 * @param obj - The object to check.
 * @returns True if the object is empty, false otherwise.
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => Object.keys(obj).length === 0;
