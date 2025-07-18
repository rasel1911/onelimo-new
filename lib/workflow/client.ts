import { Client } from "@upstash/workflow";

import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { User } from "@/db/schema/user.schema";

import { BookingWorkflowPayload } from "./types";

const validateEnvironmentVariables = () => {
	const errors: string[] = [];

	if (!process.env.QSTASH_TOKEN) {
		errors.push("QSTASH_TOKEN environment variable is required");
	}

	if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === "production") {
		errors.push("NEXT_PUBLIC_APP_URL environment variable is required for production");
	}

	if (errors.length > 0) {
		const errorMessage = `❌ Workflow configuration errors:\n${errors.join("\n")}`;
		console.error(errorMessage);
		throw new Error(errorMessage);
	}
};

validateEnvironmentVariables();

export const client = new Client({
	baseUrl: process.env.QSTASH_URL!,
	token: process.env.QSTASH_TOKEN!,
});

/**
 * Trigger the booking workflow for a new booking request
 */
export async function triggerBookingWorkflow(
	bookingRequest: BookingRequest,
	user: User,
): Promise<{ workflowRunId: string; success: boolean; error?: string }> {
	try {
		console.log(`🚀 Triggering booking workflow for request: ${bookingRequest.id}`);

		const payload: BookingWorkflowPayload = {
			bookingRequestId: bookingRequest.id,
			bookingRequest,
			user,
		};

		// Get the workflow URL
		const workflowUrl = getWorkflowUrl();

		console.log(`📡 Sending workflow request to: ${workflowUrl}`);
		console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
		console.log(`🌐 Base URL: ${process.env.NEXT_PUBLIC_APP_URL || "NOT SET"}`);

		// Trigger the workflow
		const { workflowRunId } = await client.trigger({
			url: workflowUrl,
			body: payload,
			workflowRunId: `booking-${bookingRequest.id}-${Date.now()}`,
			retries: 3,
		});

		console.log(`✅ Workflow triggered successfully. Run ID: ${workflowRunId}`);

		return {
			workflowRunId,
			success: true,
		};
	} catch (error) {
		console.error("❌ Failed to trigger booking workflow:", error);

		console.error("🔍 Debugging info:", {
			nodeEnv: process.env.NODE_ENV,
			hasQstashToken: !!process.env.QSTASH_TOKEN,
			qstashTokenLength: process.env.QSTASH_TOKEN?.length || 0,
			appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
			workflowUrl: getWorkflowUrl(),
		});

		return {
			workflowRunId: "",
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get the workflow URL based on environment
 */
function getWorkflowUrl(): string {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

	if (!baseUrl) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("NEXT_PUBLIC_APP_URL is required in production environment");
		}
		console.warn("⚠️ NEXT_PUBLIC_APP_URL not set, using localhost (development only)");
		return "http://localhost:3000/api/workflow/booking";
	}

	return `${baseUrl}/api/workflow/booking`;
}

/**
 * Get workflow status (if needed for monitoring)
 */
export async function getWorkflowStatus(workflowRunId: string) {
	try {
		// FIXME: Implement workflow status checking when available in Upstash Workflow
		console.log(`📊 Getting workflow status for ${workflowRunId}`);

		// For now, return a placeholder
		return {
			success: true,
			status: "running",
			workflowRunId,
		};
	} catch (error) {
		console.error(`❌ Failed to get workflow status:`, error);

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Cancel a running workflow (if needed)
 */
export async function cancelWorkflow(workflowRunId: string) {
	try {
		console.log(`🛑 Cancelling workflow: ${workflowRunId}`);

		// Note: This would require QStash API calls to cancel
		// Implementation depends on QStash capabilities

		return {
			success: true,
			message: "Workflow cancellation requested",
		};
	} catch (error) {
		console.error("❌ Failed to cancel workflow:", error);
		throw error;
	}
}
