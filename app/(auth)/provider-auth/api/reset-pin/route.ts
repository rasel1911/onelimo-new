import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
	getServiceProviderByResetToken,
	updateServiceProviderPin,
	clearPinResetToken,
} from "@/db/queries/serviceProvider.queries";
import { hashPin, isValidPin, validatePinSecurity } from "@/lib/utils/pin-utils";

const resetPinSchema = z.object({
	token: z.string().min(1, "Token is required"),
	providerId: z.string().uuid(),
	pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
	confirmPin: z.string().regex(/^\d{4}$/, "Confirm PIN must be 4 digits"),
});

export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const { token, providerId, pin, confirmPin } = resetPinSchema.parse(body);

		if (!isValidPin(pin)) {
			return NextResponse.json(
				{ success: false, error: "PIN must be exactly 4 digits" },
				{ status: 400 },
			);
		}

		if (pin !== confirmPin) {
			return NextResponse.json(
				{ success: false, error: "PIN and confirmation PIN do not match" },
				{ status: 400 },
			);
		}

		const securityCheck = validatePinSecurity(pin);
		if (!securityCheck.isValid) {
			return NextResponse.json(
				{ success: false, error: securityCheck.errors.join(". ") },
				{ status: 400 },
			);
		}

		const provider = await getServiceProviderByResetToken(token);

		if (!provider || provider.id !== providerId) {
			return NextResponse.json(
				{ success: false, error: "Invalid or expired reset token" },
				{ status: 400 },
			);
		}

		if (!provider.pinResetTokenExpiresAt || new Date() > provider.pinResetTokenExpiresAt) {
			return NextResponse.json(
				{ success: false, error: "Reset token has expired" },
				{ status: 400 },
			);
		}

		const pinHash = hashPin(pin);

		const updatedProvider = await updateServiceProviderPin(providerId, pinHash);

		if (!updatedProvider) {
			return NextResponse.json({ success: false, error: "Failed to update PIN" }, { status: 500 });
		}

		await clearPinResetToken(providerId);

		return NextResponse.json({
			success: true,
			message: "PIN reset successfully",
			provider: {
				id: updatedProvider.id,
				name: updatedProvider.name,
				email: updatedProvider.email,
				pinSetAt: updatedProvider.pinSetAt,
			},
		});
	} catch (error) {
		console.error("PIN reset error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid request format" },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
