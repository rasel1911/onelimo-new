import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/db";
import { getBookingRequestById } from "@/db/queries/bookingRequest.queries";
import { getRecentWorkflowRuns } from "@/db/queries/workflow/workflowRun.queries";
import { workflowRun } from "@/db/schema";
import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { WorkflowTrackingService } from "@/lib/workflow/services/workflowTrackingService";

import type { WorkflowRun } from "@/db/schema";

interface CacheEntry {
	data: any;
	timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60000 * 2;

const getCachedData = (key: string): any | null => {
	const entry = cache.get(key);
	if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
		return entry.data;
	}
	cache.delete(key);
	return null;
};

const setCachedData = (key: string, data: any): void => {
	cache.set(key, { data, timestamp: Date.now() });

	if (cache.size > 50) {
		const now = Date.now();
		for (const [cacheKey, entry] of cache.entries()) {
			if (now - entry.timestamp > CACHE_TTL) {
				cache.delete(cacheKey);
			}
		}
	}
};

/**
 * Get workflow run by booking request ID
 * @param bookingRequestId - The booking request ID to find workflow for
 * @returns WorkflowRun or null if not found
 */
const getWorkflowRunByBookingRequestId = async (
	bookingRequestId: string,
): Promise<WorkflowRun | null> => {
	try {
		const result = await db
			.select()
			.from(workflowRun)
			.where(eq(workflowRun.bookingRequestId, bookingRequestId))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error finding workflow run by booking request ID:", error);
		return null;
	}
};

/**
 * Get workflow tracking data
 */
export const GET = async (request: NextRequest) => {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const specificBookingId = searchParams.get("bookingId");

		if (specificBookingId) {
			const specificWorkflowRun = await getWorkflowRunByBookingRequestId(specificBookingId);

			if (!specificWorkflowRun) {
				console.log("❌ No workflow found for booking ID:", specificBookingId);
				return NextResponse.json({ workflowTracking: [] });
			}

			const recentWorkflowRuns = await getRecentWorkflowRuns(2);
			const recentLimited = recentWorkflowRuns.slice(0, 2);

			const isInRecent = recentLimited.some(
				(run) => run.workflowRunId === specificWorkflowRun.workflowRunId,
			);

			let allWorkflowData = [];
			if (isInRecent) {
				allWorkflowData = await Promise.all(recentLimited.map(processWorkflowRun));
			} else {
				const workflowsToProcess = [specificWorkflowRun, ...recentLimited.slice(0, 1)];
				allWorkflowData = await Promise.all(workflowsToProcess.map(processWorkflowRun));
			}

			return NextResponse.json({ workflowTracking: allWorkflowData });
		}

		const cacheKey = `workflow-tracking-${session.user.id}`;

		const cachedData = getCachedData(cacheKey);
		if (cachedData) {
			const hasActiveWorkflows = cachedData.some(
				(workflow: any) => workflow.status !== "completed" && workflow.status !== "failed",
			);

			const cacheEntry = cache.get(cacheKey);
			const cacheAge = cacheEntry ? Date.now() - cacheEntry.timestamp : CACHE_TTL;

			if (!hasActiveWorkflows || cacheAge < 15000) {
				return NextResponse.json({ workflowTracking: cachedData });
			} else {
				cache.delete(cacheKey);
			}
		}

		const workflowRuns = await getRecentWorkflowRuns(2);
		const recentWorkflowRuns = workflowRuns.slice(0, 2);

		if (recentWorkflowRuns.length === 0) {
			return NextResponse.json({ workflowTracking: [] });
		}

		const workflowTrackingData = await Promise.all(recentWorkflowRuns.map(processWorkflowRun));

		setCachedData(cacheKey, workflowTrackingData);

		return NextResponse.json({ workflowTracking: workflowTrackingData });
	} catch (error) {
		console.error("Error fetching workflow tracking data:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
};

/**
 * Process a single workflow run into tracking data
 */
const processWorkflowRun = async (workflowRun: WorkflowRun) => {
	try {
		const trackingData = await WorkflowTrackingService.getWorkflowTrackingData(
			workflowRun.workflowRunId,
		);

		let serviceInfo = "Service Request";
		let locationInfo = "Location Unknown";
		let requestCode = "Unknown Request Code";
		let bookingRequestData: BookingRequest | null = null;

		try {
			const bookingRequest = await getBookingRequestById(workflowRun.bookingRequestId);
			if (bookingRequest) {
				serviceInfo = bookingRequest.vehicleType || "Service Request";
				locationInfo = `${bookingRequest.pickupLocation.city}, ${bookingRequest.pickupLocation.postcode}`;
				requestCode = bookingRequest.requestCode;
				bookingRequestData = bookingRequest;
			}
		} catch (error) {
			console.warn(`Could not fetch booking request details for ${workflowRun.bookingRequestId}`);
		}

		return {
			...trackingData,
			bookingRequest: bookingRequestData,
			bookingId: requestCode,
			service: serviceInfo,
			location: locationInfo,
			status: mapWorkflowStatus(trackingData.status),
		};
	} catch (error) {
		console.error(`Error fetching tracking data for ${workflowRun.workflowRunId}:`, error);

		const fallbackStatistics = {
			providers: {
				totalContacted: 0,
				totalResponded: 0,
				totalQuoted: 0,
				responseRate: 0,
				quoteRate: 0,
			},
			quotes: {
				totalQuotes: 0,
				acceptedQuotes: 0,
				declinedQuotes: 0,
				averageAmount: 0,
				lowestAmount: 0,
				highestAmount: 0,
				acceptanceRate: 0,
			},
			notifications: {
				totalNotifications: 0,
				emailNotifications: 0,
				smsNotifications: 0,
				sentCount: 0,
				deliveredCount: 0,
				openedCount: 0,
				clickedCount: 0,
				failedCount: 0,
				responseCount: 0,
				deliveryRate: 0,
				openRate: 0,
				clickRate: 0,
				responseRate: 0,
			},
		};

		return {
			id: workflowRun.bookingRequestId,
			bookingId: workflowRun.bookingRequestId,
			customer: workflowRun.customerName || "Unknown Customer",
			service: "Service Request",
			location: "Location Unknown",
			date: workflowRun.startedAt.toISOString(),
			status: mapWorkflowStatus(workflowRun.status),
			currentStep: workflowRun.currentStepNumber,
			steps: [],
			rawData: {
				workflowRun,
				steps: [],
				providers: [],
				quotes: [],
				notifications: [],
				statistics: fallbackStatistics,
			},
		};
	}
};

// Helper function to map database status to display status
const mapWorkflowStatus = (dbStatus: string): string => {
	switch (dbStatus) {
		case "analyzing":
			return "Analyzing Request";
		case "sending_notifications":
			return "Sending Notifications";
		case "waiting_responses":
			return "Awaiting Responses";
		case "processing_responses":
			return "Processing Quotes";
		case "completed":
			return "Completed";
		case "failed":
			return "Failed";
		default:
			return "Unknown";
	}
};
