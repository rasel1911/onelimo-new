import { desc, eq, and } from "drizzle-orm";

import { db } from "@/db";
import {
	InsertWorkflowNotification,
	WorkflowNotification,
	workflowNotification,
} from "@/db/schema";
import { serviceProvider } from "@/db/schema/serviceProvider.schema";
import { workflowProvider } from "@/db/schema/workflow/workflowProvider.schema";

/**
 * Create workflow notifications
 * @param data - The data to create the workflow notifications with
 * @returns The created workflow notifications
 */
export async function createWorkflowNotifications(
	data: InsertWorkflowNotification[],
): Promise<WorkflowNotification[]> {
	const notifications = await db.insert(workflowNotification).values(data).returning();
	return notifications;
}

/**
 * Get notifications with provider details for a workflow run
 * @param workflowRunId - The ID of the workflow run to get the notifications for
 * @returns The notifications with provider details
 */
export async function getNotificationsWithProviderDetails(workflowRunId: string) {
	return db
		.select({
			notification: workflowNotification,
			workflowProvider: workflowProvider,
			provider: {
				id: serviceProvider.id,
				name: serviceProvider.name,
				email: serviceProvider.email,
				phone: serviceProvider.phone,
				locationId: serviceProvider.locationId,
				status: serviceProvider.status,
				serviceType: serviceProvider.serviceType,
				areaCovered: serviceProvider.areaCovered,
				reputation: serviceProvider.reputation,
				responseTime: serviceProvider.responseTime,
				role: serviceProvider.role,
				createdAt: serviceProvider.createdAt,
				updatedAt: serviceProvider.updatedAt,
			},
		})
		.from(workflowNotification)
		.leftJoin(workflowProvider, eq(workflowNotification.workflowProviderId, workflowProvider.id))
		.leftJoin(serviceProvider, eq(workflowProvider.serviceProviderId, serviceProvider.id))
		.where(eq(workflowNotification.workflowRunId, workflowRunId))
		.orderBy(desc(workflowNotification.createdAt));
}

// WORKING: Get notification summary for a workflow run (optimized for step display)
// Get workflow notifications for a workflow run
export async function getWorkflowNotificationsByWorkflowRunId(
	workflowRunId: string,
): Promise<WorkflowNotification[]> {
	return db
		.select()
		.from(workflowNotification)
		.where(eq(workflowNotification.workflowRunId, workflowRunId))
		.orderBy(desc(workflowNotification.createdAt));
}

export async function getNotificationSummary(workflowRunId: string) {
	const notifications = await getWorkflowNotificationsByWorkflowRunId(workflowRunId);

	const emailNotifications = notifications.filter((n) => n.type === "email");
	const smsNotifications = notifications.filter((n) => n.type === "sms");

	const emailSent = emailNotifications.filter(
		(n) => n.status === "sent" || n.status === "delivered",
	).length;
	const emailFailed = emailNotifications.filter((n) => n.status === "failed").length;
	const smsSent = smsNotifications.filter(
		(n) => n.status === "sent" || n.status === "delivered",
	).length;
	const smsFailed = smsNotifications.filter((n) => n.status === "failed").length;

	return {
		email: {
			total: emailNotifications.length,
			sent: emailSent,
			failed: emailFailed,
			status: emailNotifications.length > 0 ? (emailFailed === 0 ? "sent" : "partial") : "none",
		},
		sms: {
			total: smsNotifications.length,
			sent: smsSent,
			failed: smsFailed,
			status: smsNotifications.length > 0 ? (smsFailed === 0 ? "sent" : "partial") : "none",
		},
		totalProviders: new Set(notifications.map((n) => n.workflowProviderId)).size,
		totalNotifications: notifications.length,
		sentAt: notifications.find((n) => n.sentAt)?.sentAt,
	};
}

/**
 * TODO: Implement this on when user opens the notification
 * Mark notification as opened
 * @param messageId - The ID of the message to mark as opened
 */
export async function markNotificationAsOpened(messageId: string): Promise<void> {
	await db
		.update(workflowNotification)
		.set({
			openedAt: new Date(),
			status: "opened",
			updatedAt: new Date(),
		})
		.where(eq(workflowNotification.messageId, messageId));
}

/**
 * TODO: Implement this on when user clicks the notification
 * Mark notification as clicked
 * @param messageId - The ID of the message to mark as clicked
 */
export async function markNotificationAsClicked(messageId: string): Promise<void> {
	await db
		.update(workflowNotification)
		.set({
			clickedAt: new Date(),
			status: "clicked",
			updatedAt: new Date(),
		})
		.where(eq(workflowNotification.messageId, messageId));
}

/**
 * TODO: Implement this on when user responds to the notification
 * Mark notification as having response
 * @param workflowRunId - The ID of the workflow run to mark the notification as responded for
 * @param providerId - The ID of the provider to mark the notification as responded for
 */
export async function markNotificationAsResponded(
	workflowRunId: string,
	providerId: string,
): Promise<void> {
	await db
		.update(workflowNotification)
		.set({
			hasResponse: true,
			responseAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(workflowNotification.workflowRunId, workflowRunId),
				eq(workflowNotification.workflowProviderId, providerId),
			),
		);
}

/**
 * TODO: Implement this on when user retries the notification
 * Get failed notifications that can be retried
 * @param workflowRunId - The ID of the workflow run to get the retryable notifications for
 * @returns The retryable notifications
 */
export async function getRetryableNotifications(
	workflowRunId: string,
): Promise<WorkflowNotification[]> {
	return db
		.select()
		.from(workflowNotification)
		.where(
			and(
				eq(workflowNotification.workflowRunId, workflowRunId),
				eq(workflowNotification.status, "failed"),
				// retryCount < maxRetries (using SQL comparison since Drizzle doesn't have lt operator imported)
			),
		)
		.orderBy(workflowNotification.retryCount);
}
