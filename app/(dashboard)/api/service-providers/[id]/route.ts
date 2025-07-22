import { NextResponse } from "next/server";

import { getServiceProviderById } from "@/db/queries/serviceProvider.queries";

/**
 * Fetch a single service provider by their ID
 */
export const GET = async (request: Request, { params }: { params: { id: string } }) => {
	try {
		const serviceProvider = await getServiceProviderById(params.id);

		if (!serviceProvider) {
			return NextResponse.json({ error: "Service provider not found" }, { status: 404 });
		}

		const transformedProvider = {
			id: serviceProvider.id,
			name: serviceProvider.name,
			email: serviceProvider.email,
			phone: serviceProvider.phone,
			serviceType: serviceProvider.serviceType,
			areaCovered: serviceProvider.areaCovered,
			status: serviceProvider.status,
			role: serviceProvider.role,
			reputation: serviceProvider.reputation ?? undefined,
			responseTime: serviceProvider.responseTime ?? undefined,
			locationId: serviceProvider.locationId,
			locationIds: serviceProvider.locationIds,
			createdAt: serviceProvider.createdAt.toISOString(),
			updatedAt: serviceProvider.updatedAt.toISOString(),
		};

		return NextResponse.json(transformedProvider, {
			headers: {
				"Cache-Control": "private, max-age=600",
			},
		});
	} catch (error) {
		console.error("Failed to get service provider:", error);
		return NextResponse.json({ error: "Failed to load service provider" }, { status: 500 });
	}
};
