import { NextRequest, NextResponse } from "next/server";

import {
	getWorkflowQuoteAnalysis,
	updateWorkflowQuoteUserSelection,
} from "@/db/queries/workflow/workflowQuote.queries";
import {
	getWorkflowRunByQuotesHash,
	getSelectedQuoteDetails,
	updateWorkflowRunWithSelectedQuote,
} from "@/db/queries/workflow/workflowRun.queries";
import { decodeQuoteLinkFromData } from "@/lib/workflow/algorithms/linkGenerator";
import { client } from "@/lib/workflow/client";

/**
 * Get a quote from service providers
 * @param request - The request object
 * @param params - The parameters object
 * @returns The response object
 */
export const GET = async (request: NextRequest, { params }: { params: { quotesHash: string } }) => {
	try {
		const { quotesHash } = params;

		if (!quotesHash) {
			return NextResponse.json({ error: "Quotes hash is required" }, { status: 400 });
		}

		const workflowRun = await getWorkflowRunByQuotesHash(quotesHash);

		if (!workflowRun || !workflowRun.quotesEncryptedData) {
			return NextResponse.json({ error: "Quotes not found or expired" }, { status: 404 });
		}

		let decodedLinkData;
		try {
			decodedLinkData = await decodeQuoteLinkFromData(workflowRun.quotesEncryptedData);
		} catch (error) {
			console.error("Failed to decode quote link data:", error);
			return NextResponse.json({ error: "Invalid or corrupted quote link" }, { status: 400 });
		}

		if (decodedLinkData.isExpired) {
			return NextResponse.json({ error: "Quote link has expired" }, { status: 410 });
		}

		const [selectedQuoteDetails, quoteAnalysis] = await Promise.all([
			getSelectedQuoteDetails(decodedLinkData.workflowRunId),
			getWorkflowQuoteAnalysis(decodedLinkData.workflowRunId),
		]);

		const availableQuotes = quoteAnalysis.quotes.filter(
			(quote) => quote.isSelectedByAi || quote.isRecommended,
		);

		const uniqueQuotes = availableQuotes.filter(
			(quote, index, self) => index === self.findIndex((q) => q.quoteId === quote.quoteId),
		);

		return NextResponse.json({
			...quoteAnalysis,
			quotes: uniqueQuotes,
			linkData: {
				bookingRequestId: decodedLinkData.bookingRequestId,
				workflowRunId: decodedLinkData.workflowRunId,
				selectedQuoteIds: decodedLinkData.selectedQuoteIds,
				expiresAt: decodedLinkData.expiresAt,
			},
			alreadySelected: selectedQuoteDetails,
		});
	} catch (error) {
		console.error("Failed to fetch quotes by hash:", error);
		return NextResponse.json(
			{
				error: "Failed to load quotes. Please try again or contact support.",
			},
			{ status: 500 },
		);
	}
};

/**
 * Select a quote from a list of quotes
 * @param request - The request object
 * @param params - The parameters object
 * @returns The response object
 */
export const POST = async (
	request: NextRequest,
	{ params }: { params: { quotesHash: string } },
) => {
	try {
		const { quotesHash } = params;
		const body = await request.json();
		const { quoteId, providerId, message, action } = body;

		if (!quotesHash) {
			return NextResponse.json({ error: "Quotes hash is required" }, { status: 400 });
		}

		if (!quoteId || !providerId || !message) {
			return NextResponse.json(
				{
					error: "Quote ID, provider ID, and message are required",
				},
				{ status: 400 },
			);
		}

		if (!action || !["confirm", "question"].includes(action)) {
			return NextResponse.json(
				{
					error: "Action must be either 'confirm' or 'question'",
				},
				{ status: 400 },
			);
		}

		const workflowRun = await getWorkflowRunByQuotesHash(quotesHash);

		if (!workflowRun || !workflowRun.quotesEncryptedData) {
			return NextResponse.json(
				{
					error: "Quotes not found. The link may be invalid or has expired.",
				},
				{ status: 404 },
			);
		}

		let decodedLinkData;
		try {
			decodedLinkData = await decodeQuoteLinkFromData(workflowRun.quotesEncryptedData);
		} catch (error) {
			console.error("Failed to decode quote link data:", error);
			return NextResponse.json({ error: "Invalid or corrupted quote link." }, { status: 400 });
		}

		if (decodedLinkData.isExpired) {
			return NextResponse.json({ error: "Quote link has expired" }, { status: 410 });
		}

		const existingSelection = await getSelectedQuoteDetails(decodedLinkData.workflowRunId);
		if (existingSelection) {
			return NextResponse.json(
				{
					error: "A quote has already been selected for this booking.",
				},
				{ status: 409 },
			);
		}

		const quoteAnalysis = await getWorkflowQuoteAnalysis(decodedLinkData.workflowRunId);
		const selectedQuote = quoteAnalysis.quotes.find(
			(q) => q.quoteId === quoteId && q.providerId === providerId,
		);

		if (!selectedQuote) {
			return NextResponse.json(
				{
					error: "Selected quote not found or is no longer available.",
				},
				{ status: 404 },
			);
		}

		await Promise.all([
			updateWorkflowQuoteUserSelection(decodedLinkData.workflowRunId, providerId, quoteId, true),
			updateWorkflowRunWithSelectedQuote(
				decodedLinkData.workflowRunId,
				providerId,
				quoteId,
				selectedQuote.amount || 0,
				message,
				action,
			),
		]);

		try {
			await client.notify({
				eventId: `workflow-${decodedLinkData.workflowRunId}`,
				eventData: { quoteId, providerId, message },
			});
		} catch (error) {
			console.log(`⚠️ Failed to notify workflow, will be caught in next poll cycle`);
		}

		return NextResponse.json({
			success: true,
			message: "Quote selection confirmed successfully",
			selectedQuote: {
				quoteId,
				providerId,
				providerName: selectedQuote.providerName,
				amount: selectedQuote.amount,
				message,
			},
		});
	} catch (error) {
		console.error("Failed to process quote selection:", error);
		return NextResponse.json(
			{
				error: "Failed to process quote selection. Please try again.",
			},
			{ status: 500 },
		);
	}
};
