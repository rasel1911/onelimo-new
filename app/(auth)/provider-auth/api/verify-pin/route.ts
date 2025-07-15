import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
	getServiceProviderById,
	incrementFailedPinAttempts,
	resetFailedPinAttempts,
} from "@/db/queries/serviceProvider.queries";
import { createPinSession, setSessionInResponse } from "@/lib/middleware/pin-auth";
import { validatePin, MAX_PIN_ATTEMPTS } from "@/lib/utils/pin-utils";

const verifyPinSchema = z.object({
	providerId: z.string().uuid(),
	pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const { providerId, pin } = verifyPinSchema.parse(body);

		const provider = await getServiceProviderById(providerId);

		if (!provider) {
			return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
		}

		// Check if account is blocked
		if (provider.isBlocked === "true") {
			return NextResponse.json(
				{
					success: false,
					error: "Account is blocked due to too many failed attempts. Please request a PIN reset.",
					blocked: true,
					blockedAt: provider.blockedAt,
				},
				{ status: 423 },
			);
		}

		// Check if PIN is set
		if (!provider.pinHash) {
			return NextResponse.json(
				{
					success: false,
					error: "PIN not set. Please set up your PIN first.",
					setupRequired: true,
				},
				{ status: 400 },
			);
		}

		const isValidPin = validatePin(pin, provider.pinHash);

		if (isValidPin) {
			await resetFailedPinAttempts(providerId);

			const session = createPinSession(providerId);
			const response = NextResponse.json({
				success: true,
				message: "PIN verified successfully",
			});

			setSessionInResponse(response, session);

			return response;
		} else {
			const updatedProvider = await incrementFailedPinAttempts(providerId);
			const currentAttempts = updatedProvider?.failedPinAttempts || 0;
			const remainingAttempts = MAX_PIN_ATTEMPTS - currentAttempts;

			if (currentAttempts >= MAX_PIN_ATTEMPTS) {
				return NextResponse.json(
					{
						success: false,
						error:
							"Account has been blocked due to too many failed attempts. Please request a PIN reset.",
						blocked: true,
						attempts: currentAttempts,
					},
					{ status: 423 },
				);
			}

			return NextResponse.json(
				{
					success: false,
					error: "Invalid PIN. Please try again.",
					attempts: currentAttempts,
					remainingAttempts,
				},
				{ status: 401 },
			);
		}
	} catch (error) {
		console.error("PIN verification error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid request format" },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
