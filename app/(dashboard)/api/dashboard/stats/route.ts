import { NextResponse } from "next/server";

import { getBasicStats } from "@/db/queries/admin-dashboard.queries";

/**
 * Get dashboard stats for the admin dashboard
 */
export const GET = async () => {
	try {
		const stats = await getBasicStats();

		return NextResponse.json(stats, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("Failed to get dashboard stats:", error);
		return NextResponse.json({ error: "Failed to load dashboard statistics" }, { status: 500 });
	}
};
