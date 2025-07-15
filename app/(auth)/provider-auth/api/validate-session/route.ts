import { NextRequest, NextResponse } from "next/server";

import { getServiceProviderById } from "@/db/queries/serviceProvider.queries";
import { getSessionFromRequest, validatePinSession } from "@/lib/middleware/pin-auth";

export const GET = async (request: NextRequest) => {
	try {
		const session = getSessionFromRequest(request);

		if (!validatePinSession(session)) {
			return NextResponse.json({
				success: false,
				valid: false,
				error: "No valid session found",
			});
		}

		const provider = await getServiceProviderById(session!.providerId);

		if (!provider) {
			return NextResponse.json({
				success: false,
				valid: false,
				error: "Provider not found",
			});
		}

		if (provider.isBlocked === "true") {
			return NextResponse.json({
				success: false,
				valid: false,
				blocked: true,
				error: "Account is blocked",
			});
		}

		return NextResponse.json({
			success: true,
			valid: true,
			session: {
				providerId: session!.providerId,
				expiresAt: session!.expiresAt,
			},
			provider: {
				id: provider.id,
				name: provider.name,
				email: provider.email,
			},
		});
	} catch (error) {
		console.error("Session validation error:", error);
		return NextResponse.json(
			{
				success: false,
				valid: false,
				error: "Session validation failed",
			},
			{ status: 500 },
		);
	}
};
