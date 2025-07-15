import { NextRequest, NextResponse } from "next/server";

import {
	getWorkflowProviderLinkData,
	updateProviderResponseWithDetails,
	updateProviderQuote,
} from "@/db/queries/workflow/workflowProvider.queries";
import {
	BookingRequestRespondSuccessResponse,
	BookingRequestRespondErrorResponse,
} from "@/lib/types/booking-request";
import { decodeProviderLinkFromData } from "@/lib/workflow/algorithms/linkGenerator";

/**
 * Respond to a booking(accept a quote) request from a list of providers
 * @param request - The request object
 * @param params - The parameters object
 * @returns The response object
 */
export const POST = async (
	request: NextRequest,
	{ params }: { params: { bookingReqHash: string } },
): Promise<
	NextResponse<BookingRequestRespondSuccessResponse | BookingRequestRespondErrorResponse>
> => {
	try {
		const { bookingReqHash } = params;
		const body = await request.json();
		const { action, quoteAmount, notes, quoteType } = body;

		if (!bookingReqHash) {
			return NextResponse.json(
				{ success: false, error: "Booking request hash is required" },
				{ status: 400 },
			);
		}

		if (!action || !["accept", "reject"].includes(action)) {
			return NextResponse.json(
				{ success: false, error: "Valid action (accept/reject) is required" },
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
			return NextResponse.json({ success: false, error: "Link expired" }, { status: 410 });
		}

		const responseDetails = {
			action,
			quoteAmount: action === "accept" ? parseFloat(quoteAmount) : null,
			quoteType: action === "accept" ? quoteType : null,
			notes,
			respondedAt: new Date().toISOString(),
		};

		await updateProviderResponseWithDetails(
			provider.workflowRunId,
			decodedLinkData.providerId,
			action === "accept" ? "accepted" : "declined",
			notes,
			responseDetails,
		);

		if (action === "accept" && quoteAmount) {
			const quoteAmountInCents = Math.round(parseFloat(quoteAmount) * 100);
			await updateProviderQuote(
				provider.workflowRunId,
				decodedLinkData.providerId,
				quoteAmountInCents,
				`${quoteType} quote: £${quoteAmount}${notes ? ` - ${notes}` : ""}`,
			);
		}

		return NextResponse.json({
			success: true,
			message:
				action === "accept" ? "Booking accepted successfully" : "Booking rejected successfully",
			data: {
				action,
				providerId: decodedLinkData.providerId,
				workflowProviderId: decodedLinkData.workflowProviderId,
			},
		});
	} catch (error) {
		console.error("Error processing provider response:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
