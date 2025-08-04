"use server";

import { ZodError } from "zod";

import { auth } from "@/app/(auth)/auth";
import {
	createBookingSchema,
	type BookingFormData,
} from "@/app/(booking)/booking-request-form/validation/booking-form-schemas";
import { createNewBookingRequest } from "@/db/queries/bookingRequest.queries";
import { getUserById } from "@/db/queries/user.queries";
import { LocationType } from "@/db/schema/bookingRequest.schema";
import { User } from "@/db/schema/user.schema";
import { type LocationSuggestion } from "@/lib/services/geoapify";
import { triggerBookingWorkflow } from "@/lib/workflow/client";

import { SUCCESS_MESSAGES } from "../concierge/constants";

export interface BookingData {
	pickupLocation: LocationType;
	dropoffLocation: LocationType;
	pickupTime: string;
	estimatedDropoffTime: string;
	passengers: number;
	vehicleType: string;
	specialRequests?: string;
}

/**
 * Create a new booking request
 * @param bookingData - The booking data
 * @param currentUser - The current user
 * @returns The booking request
 */
const createBookingRequestInternal = async (
	bookingData: BookingData & {
		userId: string;
		customerName: string;
		estimatedDuration: number;
	},
	currentUser: User,
) => {
	const bookingRequest = await createNewBookingRequest({
		userId: bookingData.userId,
		customerName: bookingData.customerName,
		pickupLocation: bookingData.pickupLocation,
		dropoffLocation: bookingData.dropoffLocation,
		pickupTime: bookingData.pickupTime,
		estimatedDropoffTime: bookingData.estimatedDropoffTime,
		estimatedDuration: bookingData.estimatedDuration,
		passengers: bookingData.passengers,
		vehicleType: bookingData.vehicleType,
		specialRequests: bookingData.specialRequests || undefined,
	});

	try {
		const workflowResult = await triggerBookingWorkflow(bookingRequest, currentUser);
		if (!workflowResult.success) {
			console.error("❌ Workflow trigger failed:", workflowResult.error);
			console.error("📋 Booking request created but workflow not triggered:", bookingRequest.id);
		} else {
			console.log("✅ Workflow triggered successfully:", workflowResult.workflowRunId);
		}
	} catch (error) {
		console.error("❌ Critical workflow trigger error:", error);
		console.error("📋 Booking request details:", {
			id: bookingRequest.id,
			requestCode: bookingRequest.requestCode,
			customerName: bookingRequest.customerName,
		});
	}

	return bookingRequest;
};

/**
 * Get the authenticated user
 * @returns The authenticated user
 */
const getAuthenticatedUser = async () => {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			error: "Authentication required",
			user: null,
		};
	}

	const userRecord = await getUserById(session.user.id);
	if (userRecord.length === 0) {
		return {
			success: false,
			error: "User not found",
			user: null,
		};
	}

	return {
		success: true,
		error: null,
		user: {
			session: session.user,
			record: userRecord[0] as User,
		},
	};
};

/**
 * Create a new booking request
 * @param bookingData - The booking data
 * @returns The booking request
 */
export const createBookingAction = async (bookingData: BookingData) => {
	try {
		const authResult = await getAuthenticatedUser();
		if (!authResult.success || !authResult.user) {
			return {
				success: false,
				message: "Authentication required to create booking request.",
				error: authResult.error,
			};
		}

		const { session, record: currentUser } = authResult.user;

		const pickupTime = new Date(bookingData.pickupTime);
		const dropoffTime = new Date(bookingData.estimatedDropoffTime);
		const estimatedDuration = Math.round(
			(dropoffTime.getTime() - pickupTime.getTime()) / (1000 * 60),
		);

		const bookingRequest = await createBookingRequestInternal(
			{
				userId: session.id!,
				customerName: currentUser.name,
				pickupLocation: {
					city: bookingData.pickupLocation.city,
					address: bookingData.pickupLocation.address,
					postcode: bookingData.pickupLocation.postcode,
					lat: bookingData.pickupLocation.lat,
					lng: bookingData.pickupLocation.lng,
				},
				dropoffLocation: {
					city: bookingData.dropoffLocation.city,
					address: bookingData.dropoffLocation.address,
					postcode: bookingData.dropoffLocation.postcode,
					lat: bookingData.dropoffLocation.lat,
					lng: bookingData.dropoffLocation.lng,
				},
				pickupTime: bookingData.pickupTime,
				estimatedDropoffTime: bookingData.estimatedDropoffTime,
				estimatedDuration,
				passengers: bookingData.passengers,
				vehicleType: bookingData.vehicleType,
				specialRequests: bookingData.specialRequests,
			},
			currentUser,
		);

		console.log("Booking request created successfully:", bookingRequest);

		return {
			success: true,
			bookingId: bookingRequest.id,
			requestCode: bookingRequest.requestCode,
			message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
		};
	} catch (error) {
		console.error("Booking creation error:", error);
		return {
			success: false,
			message: "Failed to create booking request.",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Create a new booking request from form data
 * @param data - The form data
 * @returns The booking request
 */
export const createBookingFromForm = async (
	data: BookingFormData & {
		pickupLocationDetails: LocationSuggestion;
		dropoffLocationDetails: LocationSuggestion;
	},
) => {
	try {
		const authResult = await getAuthenticatedUser();
		if (!authResult.success || !authResult.user) {
			return {
				success: false,
				error: "Authentication required",
				fieldErrors: null,
			};
		}

		const { session, record: currentUser } = authResult.user;

		const validationResult = createBookingSchema.safeParse({
			...data,
			userId: session.id!,
			customerName: currentUser.name,
		});

		if (!validationResult.success) {
			const fieldErrors: Record<string, string> = {};
			validationResult.error.errors.forEach((error) => {
				const path = error.path.join(".");
				fieldErrors[path] = error.message;
			});

			return {
				success: false,
				error: "Validation failed",
				fieldErrors,
			};
		}

		const validatedData = validationResult.data;

		const bookingRequest = await createBookingRequestInternal(
			{
				userId: validatedData.userId,
				customerName: validatedData.customerName,
				pickupLocation: {
					city: data.pickupLocationDetails.city,
					address: data.pickupLocationDetails.formatted,
					postcode: data.pickupLocationDetails?.postcode,
					lat: data.pickupLocationDetails.lat,
					lng: data.pickupLocationDetails.lon,
				},
				dropoffLocation: {
					city: data.dropoffLocationDetails.city,
					address: data.dropoffLocationDetails.formatted,
					postcode: data.dropoffLocationDetails?.postcode,
					lat: data.dropoffLocationDetails.lat,
					lng: data.dropoffLocationDetails.lon,
				},
				pickupTime: validatedData.pickupTime,
				estimatedDropoffTime: validatedData.estimatedDropoffTime,
				estimatedDuration: validatedData.estimatedDuration,
				passengers: validatedData.passengers,
				vehicleType: validatedData.vehicleType,
				specialRequests: validatedData.specialRequests,
			},
			currentUser,
		);

		console.log("Booking request created successfully:", bookingRequest);

		return {
			success: true,
			message: "Booking request created successfully",
			requestCode: bookingRequest.requestCode,
			bookingId: bookingRequest.id,
			fieldErrors: null,
			data: {
				id: bookingRequest.id,
				requestCode: bookingRequest.requestCode,
				customerName: bookingRequest.customerName,
				pickupLocation: bookingRequest.pickupLocation,
				dropoffLocation: bookingRequest.dropoffLocation,
				pickupTime: bookingRequest.pickupTime,
				estimatedDropoffTime: bookingRequest.estimatedDropoffTime,
				passengers: bookingRequest.passengers,
				vehicleType: bookingRequest.vehicleType,
				createdAt: bookingRequest.createdAt,
			},
		};
	} catch (error) {
		console.error("Booking creation error:", error);

		if (error instanceof ZodError) {
			const fieldErrors: Record<string, string> = {};
			error.errors.forEach((err) => {
				const path = err.path.join(".");
				fieldErrors[path] = err.message;
			});

			return {
				success: false,
				error: "Validation failed",
				fieldErrors,
			};
		}

		if (error instanceof Error) {
			return {
				success: false,
				error: "Failed to create booking",
				message: error.message,
				fieldErrors: null,
			};
		}

		return {
			success: false,
			error: "Internal server error",
			message: "An unexpected error occurred",
			fieldErrors: null,
		};
	}
};
