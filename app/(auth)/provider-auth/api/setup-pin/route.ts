import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
	getServiceProviderById,
	updateServiceProviderPin,
} from "@/db/queries/serviceProvider.queries";
import { createPinSession, setSessionInResponse } from "@/lib/middleware/pin-auth";
import { hashPin, isValidPin, validatePinSecurity } from "@/lib/utils/pin-utils";

const setupPinSchema = z.object({
	providerId: z.string().uuid(),
	pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
	confirmPin: z.string().regex(/^\d{4}$/, "Confirm PIN must be 4 digits"),
});

export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const { providerId, pin, confirmPin } = setupPinSchema.parse(body);

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

		const provider = await getServiceProviderById(providerId);
		if (!provider) {
			return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
		}

		const pinHash = hashPin(pin);
		const updatedProvider = await updateServiceProviderPin(providerId, pinHash);

		if (!updatedProvider) {
			return NextResponse.json({ success: false, error: "Failed to update PIN" }, { status: 500 });
		}

		const session = createPinSession(providerId);
		const response = NextResponse.json({
			success: true,
			message: "PIN set up successfully",
			provider: {
				id: updatedProvider.id,
				name: updatedProvider.name,
				email: updatedProvider.email,
				pinSetAt: updatedProvider.pinSetAt,
			},
		});

		setSessionInResponse(response, session);
		return response;
	} catch (error) {
		console.error("PIN setup error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request format",
					details: error.errors.map((e) => e.message),
				},
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
