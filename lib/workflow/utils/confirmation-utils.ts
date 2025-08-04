import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { formatLocation } from "@/lib/utils/formatting";

import { CalendarEventData, SelectedQuoteDetails } from "../types/confirmation";

// ================================ //
// FORMATTING UTILITIES
// ================================ //

/**
 * Format booking date for display
 */
export const formatBookingDate = (date: Date | string): string => {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

/**
 * Format booking time for display
 */
export const formatBookingTime = (date: Date | string): string => {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

/**
 * Format duration from minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours > 0) {
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}

	return `${remainingMinutes}m`;
};

// ================================ //
// CALENDAR UTILITIES
// ================================ //

/**
 * Generate Google Calendar URL from event data
 */
export const generateGoogleCalendarUrl = (eventData: CalendarEventData): string => {
	const baseUrl = "https://calendar.google.com/calendar/render";
	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: eventData.title,
		dates: `${eventData.startTime}/${eventData.endTime}`,
		details: eventData.description,
		location: eventData.location,
	});

	return `${baseUrl}?${params.toString()}`;
};

/**
 * Create calendar event data from booking request
 */
export const createCalendarEventData = (
	bookingRequest: BookingRequest,
	selectedQuote: SelectedQuoteDetails,
	customerName: string,
): CalendarEventData => {
	const pickupTime = new Date(bookingRequest.pickupTime);
	const dropoffTime = new Date(bookingRequest.estimatedDropoffTime);

	const startTime = pickupTime.toISOString().replace(/[-:]/g, "").split(".")[0];
	const endTime = dropoffTime.toISOString().replace(/[-:]/g, "").split(".")[0];

	const pickupAddress = formatLocation(bookingRequest.pickupLocation);
	const dropoffAddress = formatLocation(bookingRequest.dropoffLocation);

	return {
		title: `${bookingRequest.vehicleType} - ${customerName}`,
		startTime,
		endTime,
		description: [
			`Pickup: ${pickupAddress}`,
			`Dropoff: ${dropoffAddress}`,
			`Amount: £${selectedQuote.amount}`,
			`Passengers: ${bookingRequest.passengers}`,
			bookingRequest.specialRequests ? `Notes: ${bookingRequest.specialRequests}` : "",
		]
			.filter(Boolean)
			.join("\n"),
		location: pickupAddress,
	};
};
