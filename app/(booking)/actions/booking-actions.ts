"use server";

import { ZodError } from "zod";

import { auth } from "@/app/(auth)/auth";
import {
	createBookingSchema,
	type BookingFormData,
} from "@/app/(booking)/booking-request-form/validation/booking-form-schemas";
import { createNewBookingRequest } from "@/db/queries/bookingRequest.queries";
import { getUserById } from "@/db/queries/user.queries";
import { User } from "@/db/schema/user.schema";
import { triggerBookingWorkflow } from "@/lib/workflow/client";

import { SUCCESS_MESSAGES } from "../concierge/constants";

export interface BookingActionData {
	pickupLocation: {
		cityName: string;
		postCode: string;
	};
	dropoffLocation: {
		cityName: string;
		postCode: string;
	};
	pickupDateTime: string;
	dropoffDateTime: string;
	passengers: number;
	vehicleType: string;
	specialRequests?: string;
}

const createBookingRequestInternal = async (
	bookingData: {
		userId: string;
		customerName: string;
		pickupCity: string;
		pickupPostcode: string;
		dropoffCity: string;
		dropoffPostcode: string;
		pickupTime: string;
		estimatedDropoffTime: string;
		estimatedDuration: number;
		passengers: number;
		vehicleType: string;
		specialRequests?: string;
	},
	currentUser: User,
) => {
	const bookingRequest = await createNewBookingRequest({
		userId: bookingData.userId,
		customerName: bookingData.customerName,
		pickupCity: bookingData.pickupCity,
		pickupPostcode: bookingData.pickupPostcode,
		dropoffCity: bookingData.dropoffCity,
		dropoffPostcode: bookingData.dropoffPostcode,
		pickupTime: bookingData.pickupTime,
		estimatedDropoffTime: bookingData.estimatedDropoffTime,
		estimatedDuration: bookingData.estimatedDuration,
		passengers: bookingData.passengers,
		vehicleType: bookingData.vehicleType,
		specialRequests: bookingData.specialRequests || undefined,
	});

	triggerBookingWorkflow(bookingRequest, currentUser).catch((error) => {
		console.error("Workflow trigger failed:", error);
	});

	return bookingRequest;
};

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

export const createBookingAction = async (bookingData: BookingActionData) => {
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

		const pickupTime = new Date(bookingData.pickupDateTime);
		const dropoffTime = new Date(bookingData.dropoffDateTime);
		const estimatedDuration = Math.round(
			(dropoffTime.getTime() - pickupTime.getTime()) / (1000 * 60),
		);

		const bookingRequest = await createBookingRequestInternal(
			{
				userId: session.id!,
				customerName: currentUser.name,
				pickupCity: bookingData.pickupLocation.cityName,
				pickupPostcode: bookingData.pickupLocation.postCode,
				dropoffCity: bookingData.dropoffLocation.cityName,
				dropoffPostcode: bookingData.dropoffLocation.postCode,
				pickupTime: bookingData.pickupDateTime,
				estimatedDropoffTime: bookingData.dropoffDateTime,
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

export const createBookingFromForm = async (data: BookingFormData) => {
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
				pickupCity: validatedData.pickupCity,
				pickupPostcode: validatedData.pickupPostcode,
				dropoffCity: validatedData.dropoffCity,
				dropoffPostcode: validatedData.dropoffPostcode,
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
