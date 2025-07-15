import { NextRequest, NextResponse } from "next/server";

import { getNotificationsWithProviderDetails } from "@/db/queries/workflow/workflowNotification.queries";
import {
	TransformedNotification,
	NotificationSummary,
	ResponseSummary,
} from "@/lib/workflow/types/notification";

/** Constants */
const NOTIFICATION_TYPES = {
	EMAIL: "email",
	SMS: "sms",
} as const;

const NOTIFICATION_STATUSES = {
	SENT: "sent",
	DELIVERED: "delivered",
	FAILED: "failed",
} as const;

const SUCCESS_STATUSES = [NOTIFICATION_STATUSES.SENT, NOTIFICATION_STATUSES.DELIVERED];

/**
 * Transforms raw notification data for UI consumption
 * @param item - The item to be transformed
 * @returns A transformed notification
 */
const transformNotification = (
	item: Awaited<ReturnType<typeof getNotificationsWithProviderDetails>>[0],
): TransformedNotification => ({
	notification: {
		id: item.notification.id,
		type: item.notification.type,
		recipient: item.notification.recipient,
		status: item.notification.status,
		sentAt: item.notification.sentAt?.toISOString() || null,
		errorMessage: item.notification.errorMessage,
		templateUsed: item.notification.templateUsed,
		retryCount: item.notification.retryCount || 0,
		hasResponse: item.notification.hasResponse,
		responseAt: item.notification.responseAt?.toISOString() || null,
	},
	provider: item.provider
		? {
				id: item.provider.id,
				name: item.provider.name,
				email: item.provider.email,
				phone: item.provider.phone,
				status: item.provider.status,
				serviceType: item.provider.serviceType || [],
				areaCovered: item.provider.areaCovered || [],
				reputation: item.provider.reputation || 0,
				responseTime: item.provider.responseTime || 0,
				role: item.provider.role || "provider",
				createdAt: item.provider.createdAt?.toISOString(),
				updatedAt: item.provider.updatedAt?.toISOString(),
			}
		: null,
});

/**
 * Calculates summary statistics for a specific notification type
 * @param notifications - The notifications to be generated the summary for
 * @param type - The type of notification to be generated the summary for
 * @returns A summary of the notifications
 */
const calculateNotificationSummary = (
	notifications: TransformedNotification[],
	type: string,
): NotificationSummary => {
	const filteredNotifications = notifications.filter((n) => n.notification.type === type);
	const sent = filteredNotifications.filter((n) =>
		SUCCESS_STATUSES.includes(n.notification.status as any),
	).length;
	const failed = filteredNotifications.filter(
		(n) => n.notification.status === NOTIFICATION_STATUSES.FAILED,
	).length;

	return {
		total: filteredNotifications.length,
		sent,
		failed,
		successRate: filteredNotifications.length > 0 ? (sent / filteredNotifications.length) * 100 : 0,
	};
};

/**
 * Generates comprehensive summary statistics for the notifications
 * @param notifications - The notifications to be generated the summary for
 * @returns A summary of the notifications
 */
const generateSummary = (notifications: TransformedNotification[]): ResponseSummary => {
	const emailSummary = calculateNotificationSummary(notifications, NOTIFICATION_TYPES.EMAIL);
	const smsSummary = calculateNotificationSummary(notifications, NOTIFICATION_TYPES.SMS);
	const uniqueProviders = new Set(notifications.map((n) => n.provider?.id).filter(Boolean)).size;

	return {
		total: notifications.length,
		email: emailSummary,
		sms: smsSummary,
		providers: uniqueProviders,
	};
};

/**
 * Validates workflow run ID parameter
 * @param workflowRunId - The workflow run ID to be validated
 * @returns True if the workflow run ID is valid, false otherwise
 */
const validateWorkflowRunId = (workflowRunId: string | undefined): boolean => {
	return Boolean(workflowRunId && workflowRunId.trim());
};

/**
 * Creates error response with consistent format
 * @param message - The error message
 * @param details - The details of the error
 * @param status - The status code of the error
 * @returns An error response with the message and details
 */
const createErrorResponse = (message: string, details?: string, status: number = 500) => {
	return NextResponse.json(
		{
			error: message,
			...(details && { details }),
		},
		{ status },
	);
};

/**
 * Creates success response with notifications and summary
 * @param notifications - The notifications to be returned
 * @param summary - The summary of the notifications
 * @returns A success response with the notifications and summary
 */
const createSuccessResponse = (
	notifications: TransformedNotification[],
	summary: ResponseSummary,
) => {
	return NextResponse.json({
		success: true,
		notifications,
		summary,
	});
};

/**
 * GET /api/workflow/[workflowRunId]/notifications
 * Retrieves notification details and statistics for a specific workflow run
 * @param request - The request object
 * @param params - The parameters object
 * @returns A success response with the notifications and summary
 */
export const GET = async (
	request: NextRequest,
	{ params }: { params: { workflowRunId: string } },
) => {
	try {
		const { workflowRunId } = params;

		// Validate required parameters
		if (!validateWorkflowRunId(workflowRunId)) {
			return createErrorResponse("Workflow run ID is required", undefined, 400);
		}

		// Fetch notifications with provider details
		const rawNotifications = await getNotificationsWithProviderDetails(workflowRunId);

		console.log(
			`📊 API: Retrieved ${rawNotifications.length} notification records for workflow ${workflowRunId}`,
		);

		// Transform data for UI consumption
		const notifications = rawNotifications.map(transformNotification);

		// Generate summary statistics
		const summary = generateSummary(notifications);

		return createSuccessResponse(notifications, summary);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(
			`Error fetching notifications for workflow ${params?.workflowRunId}:`,
			errorMessage,
		);

		return createErrorResponse("Failed to fetch notification details", errorMessage);
	}
};
