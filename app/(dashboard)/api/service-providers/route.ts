import { NextResponse } from "next/server";

import { getAllServiceProviders } from "@/db/queries/serviceProvider.queries";

/**
 * Fetch all service providers from the database
 */
export const GET = async () => {
	try {
		const serviceProviders = await getAllServiceProviders();

		const transformedProviders = serviceProviders.map((provider) => ({
			id: provider.id,
			name: provider.name,
			email: provider.email,
			phone: provider.phone,
			serviceType: provider.serviceType,
			areaCovered: provider.areaCovered,
			status: provider.status,
			role: provider.role,
			reputation: provider.reputation ?? undefined,
			responseTime: provider.responseTime ?? undefined,
			locationId: provider.locationId,
			createdAt: provider.createdAt.toISOString(),
			updatedAt: provider.updatedAt.toISOString(),
		}));

		return NextResponse.json(transformedProviders, {
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error) {
		console.error("Failed to get service providers:", error);
		return NextResponse.json({ error: "Failed to load service providers" }, { status: 500 });
	}
};
