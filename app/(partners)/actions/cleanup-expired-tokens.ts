"use server";

import { deleteExpiredTokens as cleanupExpiredTokens } from "@/db/queries/registrationToken.queries";

export async function cleanupExpiredInvitationTokens(): Promise<{
	success: boolean;
	message?: string;
}> {
	try {
		await cleanupExpiredTokens();
		return { success: true };
	} catch (error) {
		console.error("Error cleaning up expired tokens:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to clean up expired tokens",
		};
	}
}
