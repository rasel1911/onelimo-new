import { NextRequest, NextResponse } from "next/server";

import { getServiceProviderById } from "@/db/queries/serviceProvider.queries";

export const GET = async (request: NextRequest, { params }: { params: { providerId: string } }) => {
	try {
		const { providerId } = params;

		if (!providerId) {
			return NextResponse.json(
				{ success: false, error: "Provider ID is required" },
				{ status: 400 },
			);
		}

		const provider = await getServiceProviderById(providerId);

		if (!provider) {
			return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			provider: {
				id: provider.id,
				name: provider.name,
				email: provider.email,
				pinSetAt: provider.pinSetAt,
				failedPinAttempts: provider.failedPinAttempts,
				isBlocked: provider.isBlocked,
				blockedAt: provider.blockedAt,
			},
		});
	} catch (error) {
		console.error("Provider status error:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
