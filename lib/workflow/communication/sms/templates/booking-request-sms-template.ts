import { SMSTemplateContext } from "@/lib/workflow/types/communication";

/**
 * Generate simple SMS template for provider booking request notification
 */
export function generateBookingRequestSMS(context: SMSTemplateContext): string {
	const { bookingRequest, urls } = context;
	const pickup = bookingRequest.pickupLocation;
	const dropoff = bookingRequest.dropoffLocation;

	// Format date and time clearly
	const pickupTime = new Date(bookingRequest.pickupTime);
	const dateStr = pickupTime.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
	const timeStr = pickupTime.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Get passenger count (default to 1 if not specified)
	const passengers = bookingRequest.passengers || 1;
	const passengerText = passengers === 1 ? "1 passenger" : `${passengers} passengers`;

	const message = `New booking request for ${bookingRequest.vehicleType} on ${dateStr} at ${timeStr}.

From: ${pickup.city}
To: ${dropoff.city}
Passengers: ${passengerText}

Accept or decline: ${urls.shortLink}`;

	return message;
}

/**
 * Generate urgent SMS for time-sensitive bookings
 */
export function generateUrgentBookingRequestSMS(context: SMSTemplateContext): string {
	const { bookingRequest, urls } = context;
	const pickup = bookingRequest.pickupLocation;
	const dropoff = bookingRequest.dropoffLocation;

	const pickupTime = new Date(bookingRequest.pickupTime);
	const dateStr = pickupTime.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
	const timeStr = pickupTime.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const passengers = bookingRequest.passengers || 1;

	return `URGENT: ${bookingRequest.vehicleType} needed ${dateStr} ${timeStr}
${pickup.city} to ${dropoff.city} - ${passengers} passenger${passengers > 1 ? "s" : ""}

Accept/Decline: ${urls.shortLink}`;
}

/**
 * Generate follow-up SMS for non-responsive providers
 */
export function generateFollowUpSMS(context: SMSTemplateContext): string {
	const { urls } = context;

	return `Reminder: Booking request expires soon. Please respond at ${urls.shortLink}`;
}
