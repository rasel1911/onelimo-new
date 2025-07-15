import { NextResponse } from "next/server";

import {
	getCompletionRate,
	getWorkflowStatusBreakdown,
} from "@/db/queries/admin-dashboard.queries";

/**
 * Get workflow overview for the admin dashboard
 */
export const GET = async () => {
	try {
		const [workflowStatus, completionData] = await Promise.all([
			getWorkflowStatusBreakdown(),
			getCompletionRate(),
		]);

		return NextResponse.json(
			{
				workflowStatus,
				completionRate: completionData.completionRate,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
				},
			},
		);
	} catch (error) {
		console.error("Failed to get workflow overview:", error);
		return NextResponse.json({ error: "Failed to load workflow overview" }, { status: 500 });
	}
};
