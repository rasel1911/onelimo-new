import { tool } from "ai";
import { z } from "zod";

import { LocationType } from "@/db/schema/bookingRequest.schema";

import { createBookingAction } from "../../actions/booking-actions";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants";

export const BookingLocationSchema = z.object({
	cityName: z.string().describe("The city name"),
	postCode: z.string().describe("The postal code"),
});

export const bookingInfoSchema = z.object({
	pickupLocation: BookingLocationSchema.optional(),
	dropoffLocation: BookingLocationSchema.optional(),
	pickupDateTime: z.string().optional().describe("ISO date string for pickup date and time"),
	dropoffDateTime: z.string().optional().describe("ISO date string for dropoff date and time"),
	passengers: z.number().min(1).max(50).optional().describe("Number of passengers"),
	specialRequests: z.string().optional().describe("Special requests or notes"),
	vehicleType: z.string().optional().describe("Type of vehicle requested"),
});

/**
 * @description
 * Updates the booking session with collected information
 * The results are shown on the interactive window
 */
// FIXME: Typically this would update database
// For now, we'll just return success
export const updateBookingSessionTool = tool({
	description:
		"Update the booking session with collected information. Call this immediately after every successful validation to update the visual interface.",
	parameters: bookingInfoSchema,
	execute: async (bookingInfo) => {
		console.log("📝 Updating booking session with:", bookingInfo);

		return {
			success: true,
			message: SUCCESS_MESSAGES.BOOKING_UPDATED,
			updatedInfo: bookingInfo,
		};
	},
});

/**
 * @description
 * Confirms the booking with all collected information
 * Results are shown on the interactive window
 */
export const confirmBookingTool = tool({
	description: "Confirm and finalize the luxury car booking with all collected information",
	parameters: z.object({
		finalBookingDetails: bookingInfoSchema.required({
			pickupLocation: true,
			dropoffLocation: true,
			pickupDateTime: true,
			dropoffDateTime: true,
			vehicleType: true,
			passengers: true,
		}),
		customerConfirmation: z.boolean().describe("Whether the customer has confirmed all details"),
	}),
	execute: async ({ finalBookingDetails, customerConfirmation }) => {
		console.log("✅ Confirming booking:", { finalBookingDetails, customerConfirmation });

		if (!customerConfirmation) {
			return {
				success: false,
				message: ERROR_MESSAGES.CUSTOMER_CONFIRMATION_REQUIRED,
			};
		}

		// Trigger the booking workflow
		const result = await createBookingAction({
			pickupLocation: finalBookingDetails.pickupLocation as unknown as LocationType,
			dropoffLocation: finalBookingDetails.dropoffLocation as unknown as LocationType,
			pickupTime: finalBookingDetails.pickupDateTime!,
			estimatedDropoffTime: finalBookingDetails.dropoffDateTime,
			passengers: finalBookingDetails.passengers!,
			vehicleType: finalBookingDetails.vehicleType!,
			specialRequests: finalBookingDetails.specialRequests,
		});

		if (!result.success) {
			return {
				success: false,
				message: result.message,
				error: result.error,
			};
		}

		return {
			success: true,
			bookingId: result.bookingId,
			requestCode: result.requestCode,
			message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
			bookingDetails: finalBookingDetails,
			nextSteps: ["You will receive a confirmation notification shortly"],
		};
	},
});

/**
 * @description
 * Resets the booking session and starts fresh when user wants to start a new booking
 */
export const resetBookingSessionTool = tool({
	description: "Reset the booking session and start fresh when user wants to start a new booking",
	parameters: z.object({
		confirmReset: z.boolean().describe("Whether to confirm the reset action"),
	}),
	execute: async ({ confirmReset }) => {
		console.log("🔄 Resetting booking session:", { confirmReset });

		if (!confirmReset) {
			return {
				success: false,
				message: "Reset cancelled.",
			};
		}

		return {
			success: true,
			message: SUCCESS_MESSAGES.SESSION_RESET,
			action: "reset_session",
		};
	},
});
