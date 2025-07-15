import { NextRequest, NextResponse } from "next/server";

import { getBookingRequestWithWorkflowRunAndProvider } from "@/db/queries/bookingRequest.queries";
import { getWorkflowProviderLinkData } from "@/db/queries/workflow/workflowProvider.queries";
import {
	BookingRequestResponse,
	BookingRequestApiSuccessResponse,
	BookingRequestApiErrorResponse,
} from "@/lib/types/booking-request";
import { decodeProviderLinkFromData } from "@/lib/workflow/algorithms/linkGenerator";

/**
 * Get a booking request to show on provider's dashboard
 * @param request - The request object
 * @param params - The parameters object
 * @returns The response object
 */
export const GET = async (
	request: NextRequest,
	{ params }: { params: { bookingReqHash: string } },
): Promise<NextResponse<BookingRequestApiSuccessResponse | BookingRequestApiErrorResponse>> => {
	try {
		const { bookingReqHash } = params;

		if (!bookingReqHash) {
			return NextResponse.json(
				{ success: false, error: "Booking request hash is required" },
				{ status: 400 },
			);
		}

		const providerData = await getWorkflowProviderLinkData(bookingReqHash);

		if (!providerData || providerData.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Booking request not found" },
				{ status: 404 },
			);
		}

		const provider = providerData[0];

		let decodedLinkData;
		try {
			decodedLinkData = await decodeProviderLinkFromData(provider.linkEncryptedData!);
		} catch (error) {
			console.error("Error decoding link data:", error);
			return NextResponse.json(
				{ success: false, error: "Invalid booking request link" },
				{ status: 400 },
			);
		}

		if (provider.linkExpiresAt && new Date() > provider.linkExpiresAt) {
			return NextResponse.json(
				{
					success: false,
					error: "Link expired",
					expired: true,
					providerId: decodedLinkData.providerId,
				},
				{ status: 410 },
			);
		}

		const bookingWithWorkflowData =
			await getBookingRequestWithWorkflowRunAndProvider(decodedLinkData);

		if (!bookingWithWorkflowData || bookingWithWorkflowData.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Booking request not found" },
				{ status: 404 },
			);
		}

		const bookingData = bookingWithWorkflowData[0];

		let cleanedSpecialRequests = bookingData.specialRequests || null;
		if (bookingData.bookingAnalysis) {
			const analysis = bookingData.bookingAnalysis as any;
			cleanedSpecialRequests =
				analysis.cleanedMessage || bookingData.specialRequests || "No special requests";
		}

		const responseData: BookingRequestResponse = {
			id: bookingData.id,
			createdAt: bookingData.createdAt.toISOString(),
			requestCode: bookingData.requestCode,
			customerName: bookingData.customerName || "Anonymous Customer",
			pickupLocation: bookingData.pickupLocation,
			dropoffLocation: bookingData.dropoffLocation,
			pickupTime: bookingData.pickupTime.toISOString(),
			estimatedDropoffTime: bookingData.estimatedDropoffTime.toISOString(),
			passengers: bookingData.passengers || 1,
			vehicleType: bookingData.vehicleType || "Standard",
			status: bookingData.responseStatus || "pending",
			estimatedDuration: bookingData.estimatedDuration || 30,
			estimatedDistance: Math.round((bookingData.estimatedDuration || 30) * 0.5) || 5,
			specialRequests: cleanedSpecialRequests,
			providerId: decodedLinkData.providerId,
			workflowProviderId: decodedLinkData.workflowProviderId,
			bookingRequestId: decodedLinkData.bookingRequestId,
			workflowRunId: bookingData.workflowRunId,
			serviceProviderId: bookingData.serviceProviderId,
			hasResponded: bookingData.hasResponded,
			responseStatus: bookingData.responseStatus || null,
			responseTime: bookingData.responseTime?.toISOString() || null,
			hasQuoted: bookingData.hasQuoted || null,
			quoteAmount: bookingData.quoteAmount || null,
			quoteTime: bookingData.quoteTime?.toISOString() || null,
			bookingAnalysis: bookingData.bookingAnalysis,
		};

		return NextResponse.json(
			{
				success: true,
				data: responseData,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
			},
		);
	} catch (error) {
		console.error("Error fetching booking request:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
