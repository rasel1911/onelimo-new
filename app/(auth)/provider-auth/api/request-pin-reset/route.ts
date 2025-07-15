import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
	getServiceProviderByEmail,
	createPinResetToken,
} from "@/db/queries/serviceProvider.queries";
import { sendEmail } from "@/lib/email";
import { generateResetToken, PIN_RESET_TOKEN_EXPIRY_HOURS } from "@/lib/utils/pin-utils";

import { createResetEmailHtml, createResetEmailText } from "./reset-pin-email-template";

const requestResetSchema = z.object({
	email: z.string().email("Please provide a valid email address"),
});

export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const { email } = requestResetSchema.parse(body);

		const provider = await getServiceProviderByEmail(email);

		if (!provider) {
			return NextResponse.json({
				success: true,
				message: "If an account with this email exists, a reset link has been sent.",
			});
		}

		const resetToken = generateResetToken();
		const expiresAt = new Date(Date.now() + PIN_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

		await createPinResetToken(provider.id, resetToken, expiresAt);

		const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
		const resetUrl = `${baseUrl}/provider-auth/reset-pin?token=${resetToken}`;

		try {
			await sendEmail({
				to: provider.email,
				template: {
					subject: "PIN Reset Request - Onelimo",
					html: createResetEmailHtml(provider.name, resetUrl),
					text: createResetEmailText(provider.name, resetUrl),
				},
			});

			return NextResponse.json({
				success: true,
				message: "PIN reset instructions have been sent to your email address.",
			});
		} catch (emailError) {
			console.error("Failed to send reset email:", emailError);

			return NextResponse.json(
				{
					success: false,
					error: "Failed to send reset email. Please try again later.",
				},
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("PIN reset request error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					error: "Please provide a valid email address",
				},
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
};
