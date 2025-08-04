import { BookingRequest, LocationType } from "@/db/schema/bookingRequest.schema";
import { formatLocation } from "@/lib/utils/formatting";

import { SCORING_PENALTIES } from "./constants";
import { ContactAnalysisResult } from "./types";

/**
 * Calculate score penalty based on contact violation severity
 */
export function calculateContactPenalty(severity: "low" | "medium" | "high"): number {
	switch (severity) {
		case "high":
			return SCORING_PENALTIES.CONTACT_VIOLATION.HIGH;
		case "medium":
			return SCORING_PENALTIES.CONTACT_VIOLATION.MEDIUM;
		case "low":
			return SCORING_PENALTIES.CONTACT_VIOLATION.LOW;
		default:
			return 0;
	}
}

/**
 * Apply contact violation penalty to base score
 */
export function applyContactPenalty(
	baseScore: number,
	contactAnalysis: ContactAnalysisResult,
): number {
	if (!contactAnalysis.hasContactDetails) {
		return baseScore;
	}

	const penalty = calculateContactPenalty(contactAnalysis.severity);
	return Math.max(15, baseScore - penalty);
}

/**
 * Format booking details for AI prompt
 */
export function formatBookingDetails(
	bookingRequest: BookingRequest,
	cleanedMessage: string,
): string {
	const pickup = bookingRequest.pickupLocation as LocationType;
	const dropoff = bookingRequest.dropoffLocation as LocationType;

	return `
Customer: ${bookingRequest.customerName}
Pickup Location: ${formatLocation(pickup)}
Dropoff Location: ${formatLocation(dropoff)}
Pickup Time: ${new Date(bookingRequest.pickupTime).toLocaleString()}
Estimated Dropoff Time: ${new Date(bookingRequest.estimatedDropoffTime).toLocaleString()}
Estimated Duration: ${bookingRequest.estimatedDuration} minutes
Passengers: ${bookingRequest.passengers}
Vehicle Type: ${bookingRequest.vehicleType}
Special Requests: ${cleanedMessage || "None"}
Request Code: ${bookingRequest.requestCode}
	`.trim();
}

/**
 * Validate and sanitize text input
 */
export function validateTextInput(text: string): string {
	if (!text || typeof text !== "string") {
		return "";
	}
	return text.trim();
}
