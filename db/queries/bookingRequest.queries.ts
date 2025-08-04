import { desc, eq, sql } from "drizzle-orm";

import db from "@/db/connection";
import { CreateBookingRequestInput } from "@/lib/types/booking-request";
import { DecodedProviderLink } from "@/lib/workflow/types/provider-link";

import { bookingRequest, BookingRequest } from "../schema/bookingRequest.schema";
import { workflowProvider } from "../schema/workflow/workflowProvider.schema";
import { workflowRun } from "../schema/workflow/workflowRun.schema";

/**
 * Create a new booking request
 * @param input - The input data for the booking request
 * @returns The created booking request
 */
export const createNewBookingRequest = async (
	input: CreateBookingRequestInput,
): Promise<BookingRequest> => {
	return await createBookingRequest({
		userId: input.userId,
		customerName: input.customerName,
		pickupLocation: input.pickupLocation,
		dropoffLocation: input.dropoffLocation,
		pickupTime: input.pickupTime instanceof Date ? input.pickupTime : new Date(input.pickupTime),
		estimatedDropoffTime:
			input.estimatedDropoffTime instanceof Date
				? input.estimatedDropoffTime
				: new Date(input.estimatedDropoffTime),
		estimatedDuration: input.estimatedDuration,
		passengers: input.passengers,
		vehicleType: input.vehicleType,
		specialRequests: input.specialRequests || null,
	});
};

/**
 * Get a single booking request by ID
 * @param id - The ID of the booking request
 * @returns The booking request
 */
export async function getBookingRequestById(id: string): Promise<BookingRequest | undefined> {
	try {
		const results = await db.select().from(bookingRequest).where(eq(bookingRequest.id, id));

		return results[0];
	} catch (error) {
		console.error(`Failed to get booking request with ID ${id}`, error);
		throw error;
	}
}

/**
 * Create a new booking request
 * @param data - The data for the booking request
 * @returns The created booking request
 */
export async function createBookingRequest(
	data: Omit<BookingRequest, "id" | "createdAt" | "updatedAt" | "requestCode">,
): Promise<BookingRequest> {
	try {
		const requestCode = `BRQ-${Math.floor(10000 + Math.random() * 90000)}`;

		const result = await db
			.insert(bookingRequest)
			.values({
				...data,
				requestCode,
			})
			.returning();

		return result[0];
	} catch (error) {
		console.error("Failed to create booking request", error);
		throw error;
	}
}

/**
 * Get a booking request with workflow run and provider data
 * @param bookingRequestId - The ID of the booking request
 * @param workflowProviderId - The ID of the workflow provider
 * @returns The booking request with workflow run and provider data
 */
export async function getBookingRequestWithWorkflowRunAndProvider({
	bookingRequestId,
	workflowProviderId,
}: DecodedProviderLink) {
	try {
		return await db
			.select({
				id: bookingRequest.id,
				requestCode: bookingRequest.requestCode,
				userId: bookingRequest.userId,
				customerName: bookingRequest.customerName,
				pickupLocation: bookingRequest.pickupLocation,
				dropoffLocation: bookingRequest.dropoffLocation,
				pickupTime: bookingRequest.pickupTime,
				estimatedDropoffTime: bookingRequest.estimatedDropoffTime,
				estimatedDuration: bookingRequest.estimatedDuration,
				passengers: bookingRequest.passengers,
				vehicleType: bookingRequest.vehicleType,
				specialRequests: bookingRequest.specialRequests,
				createdAt: bookingRequest.createdAt,

				workflowRunId: workflowRun.workflowRunId,
				bookingAnalysis: workflowRun.bookingAnalysis,

				providerId: workflowProvider.id,
				serviceProviderId: workflowProvider.serviceProviderId,
				hasResponded: workflowProvider.hasResponded,
				responseStatus: workflowProvider.responseStatus,
				responseTime: workflowProvider.responseTime,
				hasQuoted: workflowProvider.hasQuoted,
				quoteAmount: workflowProvider.quoteAmount,
				quoteTime: workflowProvider.quoteTime,
			})
			.from(bookingRequest)
			.leftJoin(workflowRun, eq(workflowRun.bookingRequestId, bookingRequestId))
			.leftJoin(workflowProvider, eq(workflowProvider.id, workflowProviderId))
			.where(eq(bookingRequest.id, bookingRequestId));
	} catch (error) {
		console.error(
			`Failed to get booking request with workflow data for hash ${bookingRequestId}`,
			error,
		);
		throw error;
	}
}

/**
 * Get all booking requests with workflow status for admin dashboard
 * @param options - The options for the query
 * @returns The booking requests with workflow status
 */
export async function getAllBookingRequestsWithStatus(options?: {
	page?: number;
	limit?: number;
}): Promise<{ bookings: any[]; hasMore: boolean; total: number }> {
	try {
		const { page = 1, limit = 10 } = options || {};
		const offset = (page - 1) * limit;

		const totalResult = await db.select({ count: sql<number>`count(*)` }).from(bookingRequest);
		const total = totalResult[0].count;

		const bookings = await db
			.select({
				id: bookingRequest.id,
				requestCode: bookingRequest.requestCode,
				customerName: bookingRequest.customerName,
				pickupLocation: bookingRequest.pickupLocation,
				dropoffLocation: bookingRequest.dropoffLocation,
				pickupTime: bookingRequest.pickupTime,
				estimatedDropoffTime: bookingRequest.estimatedDropoffTime,
				vehicleType: bookingRequest.vehicleType,
				passengers: bookingRequest.passengers,
				createdAt: bookingRequest.createdAt,
				updatedAt: bookingRequest.updatedAt,

				workflowStatus: workflowRun.status,
				workflowCurrentStep: workflowRun.currentStep,
				workflowCompletedAt: workflowRun.completedAt,
				totalProvidersContacted: workflowRun.totalProvidersContacted,
				totalQuotesReceived: workflowRun.totalQuotesReceived,
			})
			.from(bookingRequest)
			.leftJoin(workflowRun, eq(workflowRun.bookingRequestId, sql`${bookingRequest.id}::text`))
			.orderBy(desc(bookingRequest.createdAt))
			.limit(limit)
			.offset(offset);

		const hasMore = offset + bookings.length < total;

		return {
			bookings,
			hasMore,
			total,
		};
	} catch (error) {
		console.error("Failed to get booking requests with status from database", error);
		throw error;
	}
}
