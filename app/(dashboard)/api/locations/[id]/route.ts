import { NextResponse } from "next/server";

import { getLocationById } from "@/db/queries/location.queries";

/**
 * Fetch a single location by their ID
 * @returns A single location
 */
export const GET = async (request: Request, { params }: { params: { id: string } }) => {
	try {
		const location = await getLocationById(params.id);

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		const transformedLocation = {
			id: location.id,
			city: location.city,
			zipcodes: location.zipcodes,
			createdAt: location.createdAt.toISOString(),
			updatedAt: location.updatedAt.toISOString(),
		};

		return NextResponse.json(transformedLocation, {
			headers: {
				"Cache-Control": "private, max-age=600",
			},
		});
	} catch (error) {
		console.error("Error fetching location:", error);
		return NextResponse.json({ error: "Failed to load location" }, { status: 500 });
	}
};
