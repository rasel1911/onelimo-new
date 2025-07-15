import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import db from "@/db/connection";

import { bookingRequest } from "../schema/bookingRequest.schema";
import { location } from "../schema/location.schema";
import { registrationToken } from "../schema/registrationToken.schema";
import { serviceProvider } from "../schema/serviceProvider.schema";
import { user } from "../schema/user.schema";
import { workflowRun } from "../schema/workflow/workflowRun.schema";

/**
 * Get basic stats for the admin dashboard
 */
export const getBasicStats = async () => {
	const [
		bookingRequestsCount,
		serviceProvidersCount,
		locationsCount,
		usersCount,
		adminsCount,
		invitationsCount,
	] = await Promise.all([
		db.select({ count: count() }).from(bookingRequest),
		db.select({ count: count() }).from(serviceProvider).where(eq(serviceProvider.status, "active")),
		db.select({ count: count() }).from(location),
		db
			.select({ count: count() })
			.from(user)
			.where(and(eq(user.status, "active"), eq(user.role, "user"))),
		db
			.select({ count: count() })
			.from(user)
			.where(and(eq(user.status, "active"), eq(user.role, "admin"))),
		db.select({ count: count() }).from(registrationToken),
	]);

	return {
		bookingRequests: Number(bookingRequestsCount[0]?.count) || 0,
		serviceProviders: Number(serviceProvidersCount[0]?.count) || 0,
		locations: Number(locationsCount[0]?.count) || 0,
		activeUsers: Number(usersCount[0]?.count) || 0,
		admins: Number(adminsCount[0]?.count) || 0,
		invitations: Number(invitationsCount[0]?.count) || 0,
		activeWorkflows: 0,
		completedWorkflows: 0,
	};
};

/**
 * Get recent activity for the admin dashboard
 */
export const getRecentActivity = async () => {
	const [recentBookings, recentWorkflows] = await Promise.all([
		db
			.select({
				id: bookingRequest.id,
				requestCode: bookingRequest.requestCode,
				customerName: bookingRequest.customerName,
				vehicleType: bookingRequest.vehicleType,
				passengers: bookingRequest.passengers,
				createdAt: bookingRequest.createdAt,
				workflowStatus: workflowRun.status,
				totalQuotesReceived: workflowRun.totalQuotesReceived,
			})
			.from(bookingRequest)
			.leftJoin(workflowRun, eq(workflowRun.bookingRequestId, sql`${bookingRequest.id}::text`))
			.orderBy(desc(bookingRequest.createdAt))
			.limit(5),

		db
			.select({
				id: workflowRun.id,
				customerName: workflowRun.customerName,
				status: workflowRun.status,
				currentStep: workflowRun.currentStep,
				totalProvidersContacted: workflowRun.totalProvidersContacted,
				totalQuotesReceived: workflowRun.totalQuotesReceived,
				updatedAt: workflowRun.updatedAt,
			})
			.from(workflowRun)
			.orderBy(desc(workflowRun.updatedAt))
			.limit(5),
	]);

	return {
		recentBookings,
		recentWorkflows,
	};
};

/**
 * Get workflow status breakdown for the admin dashboard
 */
export const getWorkflowStatusBreakdown = async () => {
	return await db
		.select({
			status: workflowRun.status,
			count: count(),
		})
		.from(workflowRun)
		.groupBy(workflowRun.status);
};

/**
 * Get completion rate for the admin dashboard
 */
export const getCompletionRate = async () => {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const result = await db
		.select({
			total: count(),
			completed: sql<number>`COUNT(CASE WHEN ${workflowRun.status} = 'completed' THEN 1 END)`,
		})
		.from(workflowRun)
		.where(gte(workflowRun.startedAt, thirtyDaysAgo));

	const total = result[0]?.total || 0;
	const completed = result[0]?.completed || 0;

	return {
		completionRate: total > 0 ? (completed / total) * 100 : 0,
		totalWorkflows: total,
		completedWorkflows: completed,
	};
};
