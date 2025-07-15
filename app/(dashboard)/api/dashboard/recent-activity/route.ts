import { NextResponse } from "next/server";

import { getRecentActivity } from "@/db/queries/admin-dashboard.queries";

/**
 * Get recent activity for the admin dashboard
 */
export const GET = async () => {
	try {
		const { recentBookings, recentWorkflows } = await getRecentActivity();

		const transformedBookings = recentBookings.map((booking) => ({
			...booking,
			createdAt: booking.createdAt.toISOString(),
			workflowStatus: booking.workflowStatus || undefined,
			totalQuotesReceived: booking.totalQuotesReceived || undefined,
		}));

		const transformedWorkflows = recentWorkflows.map((workflow) => ({
			...workflow,
			customerName: workflow.customerName || "Unknown Customer",
			updatedAt: workflow.updatedAt.toISOString(),
			totalProvidersContacted: workflow.totalProvidersContacted || undefined,
			totalQuotesReceived: workflow.totalQuotesReceived || undefined,
		}));

		return NextResponse.json(
			{
				recentBookings: transformedBookings,
				recentWorkflows: transformedWorkflows,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
				},
			},
		);
	} catch (error) {
		console.error("Failed to get recent activity:", error);
		return NextResponse.json({ error: "Failed to load recent activity" }, { status: 500 });
	}
};
