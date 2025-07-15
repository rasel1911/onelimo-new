import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServiceProviderByResetToken } from "@/db/queries/serviceProvider.queries";

const validateTokenSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const { token } = validateTokenSchema.parse(body);

		const provider = await getServiceProviderByResetToken(token);

		if (!provider) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid or expired reset token",
				},
				{ status: 400 },
			);
		}

		// Check if token is expired
		if (!provider.pinResetTokenExpiresAt || new Date() > provider.pinResetTokenExpiresAt) {
			return NextResponse.json(
				{
					success: false,
					error: "Reset token has expired",
					expired: true,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json({
			success: true,
			provider: {
				id: provider.id,
				name: provider.name,
				email: provider.email,
			},
		});
	} catch (error) {
		console.error("Token validation error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid request format" },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
