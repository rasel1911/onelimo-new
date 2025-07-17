import { NextResponse } from "next/server";

import { getAllLocations } from "@/db/queries/location.queries";

/**
 * Fetch all locations from the database
 * @returns All locations
 */
export const GET = async () => {
	try {
		const locations = await getAllLocations();

		const transformedLocations = locations.map((location) => ({
			id: location.id,
			city: location.city,
			zipcodes: location.zipcodes,
			createdAt: location.createdAt.toISOString(),
			updatedAt: location.updatedAt.toISOString(),
		}));

		return NextResponse.json(transformedLocations, {
			headers: {
				"Cache-Control": "private, max-age=600",
			},
		});
	} catch (error) {
		console.error("Error fetching locations:", error);
		return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
	}
};
