/********************
 * APP CONFIGURATION
 ********************/
export const APP_CONFIG = {
	CHAT_API_ENDPOINT: "/api/concierge/chat",
	MAX_BOOKING_STEPS: 10,
	MINIMUM_FUTURE_TIME_MINUTES: 180,
	MAX_FUTURE_TIME_YEARS: 1,
	MAX_PASSENGERS: 20,
	MIN_PASSENGERS: 1,
	TOOL_COMPLETION_DELAY: 500,
	MESSAGE_DUPLICATE_THRESHOLD: 5000,
} as const;

/********************
 * UI CONFIGURATION
 ********************/
export const UI_CONFIG = {
	CHAT_WINDOW_WIDTH: "w-2/5",
	BOOKING_WINDOW_MAX_WIDTH: "max-w-4xl",
	SUGGESTION_CARD_DELAY: 250,
	ANIMATION_DELAY: {
		SCALE: 0.3,
		OPACITY: 0.5,
		STAGGER: 0.6,
		CONTENT: 0.8,
	},
} as const;

/********************
 * TOOL NAMES
 ********************/
export const TOOL_NAMES = {
	VALIDATE_LOCATION: "validateLocation",
	VALIDATE_DATE_TIME: "validateDateTime",
	UPDATE_BOOKING_SESSION: "updateBookingSession",
	CONFIRM_BOOKING: "confirmBooking",
	RESET_BOOKING_SESSION: "resetBookingSession",
} as const;

/********************
 * BOOKING STATUS
 ********************/
export const BOOKING_STATUS = {
	PENDING: "pending",
	COMPLETED: "completed",
	ERROR: "error",
	CONFIRMED: "confirmed",
} as const;

/********************
 * CHAT STATUS
 ********************/
export const CHAT_STATUS = {
	STREAMING: "streaming",
	SUBMITTED: "submitted",
	READY: "ready",
	ERROR: "error",
} as const;

/********************
 * VALID CITIES
 ********************/
export const VALID_CITIES = [
	"London",
	"Manchester",
	"Birmingham",
	"Liverpool",
	"Leeds",
	"Bristol",
	"Oxford",
	"Newport",
	"Norwich",
	"Chester",
	"Cambridge",
	"Wells",
] as const;

/********************
 * TIME FORMATS
 ********************/
export const TIME_FORMATS = {
	LOCALE: "en-GB",
	DATE_OPTIONS: {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	} as const,
	TIME_OPTIONS: {
		hour: "2-digit",
		minute: "2-digit",
	} as const,
} as const;

/********************
 * ERROR MESSAGES
 ********************/
export const ERROR_MESSAGES = {
	LOCATION_NOT_SERVICED: "Sorry, we don't currently service this location.",
	INVALID_POSTCODE: "doesn't appear to be a valid UK postal code. Please check and try again.",
	INVALID_DATETIME:
		"I couldn't understand the date/time format. Try formats like 'today at 3pm', 'tomorrow morning', etc.",
	BOOKING_TOO_EARLY: "The booking time must be at least 30 minutes from now.",
	BOOKING_TOO_FAR:
		"The booking time is too far in the future. Please choose a date within the next year.",
	CUSTOMER_CONFIRMATION_REQUIRED:
		"Confirmation is required before finalizing the booking.",
	INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

/********************
 * SUCCESS MESSAGES
 ********************/
export const SUCCESS_MESSAGES = {
	LOCATION_CONFIRMED: "location confirmed",
	BOOKING_CONFIRMED: "Booking request received! Your luxury car booking is being processed.",
	SESSION_RESET:
		"I've cleared your previous booking information. Let's start fresh with your new booking.",
	BOOKING_UPDATED: "Booking information updated successfully",
} as const;

/********************
 * REGEX PATTERNS
 ********************/
export const PATTERNS = {
	UK_POSTCODE: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
} as const;
