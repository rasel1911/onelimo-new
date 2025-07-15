import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
	workflowRun,
	workflowStep,
	workflowProvider,
	workflowQuote,
	workflowNotification,
	serviceProvider,
} from "@/db/schema";

export * from "./workflowRun.queries";
export * from "./workflowQuote.queries";
export * from "./workflowProvider.queries";
export * from "./workflowNotification.queries";
export * from "./workflowStep.queries";

/**
 * Optimized single-query function to get all workflow tracking data
 * Uses joins and indexing for performance optimization
 * @param workflowRunId - The ID of the workflow run to get tracking data for
 * @returns Complete workflow tracking data with all related entities
 */
export async function getWorkflowTrackingDataOptimized(workflowRunId: string) {
	try {
		const result = await db
			.select({
				workflowRun: workflowRun,
				step: workflowStep,
				workflowProvider: workflowProvider,
				serviceProvider: serviceProvider,
				workflowQuote: workflowQuote,
				workflowNotification: workflowNotification,
			})
			.from(workflowRun)
			.leftJoin(workflowStep, eq(workflowStep.workflowRunId, workflowRun.workflowRunId))
			.leftJoin(workflowProvider, eq(workflowProvider.workflowRunId, workflowRun.workflowRunId))
			.leftJoin(serviceProvider, eq(serviceProvider.id, workflowProvider.serviceProviderId))
			.leftJoin(workflowQuote, eq(workflowQuote.workflowRunId, workflowRun.workflowRunId))
			.leftJoin(
				workflowNotification,
				eq(workflowNotification.workflowRunId, workflowRun.workflowRunId),
			)
			.where(eq(workflowRun.workflowRunId, workflowRunId))
			.orderBy(
				desc(workflowStep.stepNumber),
				desc(workflowProvider.createdAt),
				desc(workflowQuote.createdAt),
				desc(workflowNotification.createdAt),
			);

		if (!result || result.length === 0) {
			return null;
		}

		const workflowRunData = result[0].workflowRun;

		const stepsMap = new Map();
		result.forEach((row) => {
			if (row.step && !stepsMap.has(row.step.stepName)) {
				stepsMap.set(row.step.stepName, row.step);
			}
		});
		const steps = Array.from(stepsMap.values());

		const providersMap = new Map();
		result.forEach((row) => {
			if (row.workflowProvider && !providersMap.has(row.workflowProvider.id)) {
				providersMap.set(row.workflowProvider.id, {
					...row.workflowProvider,
					providerName: row.serviceProvider?.name || "Unknown Provider",
					providerEmail: row.serviceProvider?.email || null,
					providerPhone: row.serviceProvider?.phone || null,
					serviceType: row.serviceProvider?.serviceType || null,
					areaCovered: row.serviceProvider?.areaCovered || [],
					status: row.serviceProvider?.status || "unknown",
					reputation: row.serviceProvider?.reputation || 0,
				});
			}
		});
		const providers = Array.from(providersMap.values());

		const quotesMap = new Map();
		result.forEach((row) => {
			if (row.workflowQuote && !quotesMap.has(row.workflowQuote.id)) {
				quotesMap.set(row.workflowQuote.id, row.workflowQuote);
			}
		});
		const quotes = Array.from(quotesMap.values());

		const notificationsMap = new Map();
		result.forEach((row) => {
			if (row.workflowNotification && !notificationsMap.has(row.workflowNotification.id)) {
				notificationsMap.set(row.workflowNotification.id, row.workflowNotification);
			}
		});
		const notifications = Array.from(notificationsMap.values());

		return {
			workflowRun: workflowRunData,
			steps,
			providers,
			quotes,
			notifications,
		};
	} catch (error) {
		console.error("Failed to get optimized workflow tracking data:", error);
		throw error;
	}
}
