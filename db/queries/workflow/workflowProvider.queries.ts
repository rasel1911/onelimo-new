import { eq, and, asc, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
	InsertWorkflowProvider,
	WorkflowProvider,
	workflowProvider,
	serviceProvider,
} from "@/db/schema";

/**
 * Create workflow providers
 * @param data - The data to create the workflow providers with
 * @returns The created workflow providers
 */
export async function createWorkflowProviders(
	data: InsertWorkflowProvider[],
): Promise<WorkflowProvider[]> {
	const providers = await db.insert(workflowProvider).values(data).returning();
	return providers;
}

/**
 * Update provider response
 * @param workflowRunId - The ID of the workflow run to update the provider response for
 * @param serviceProviderId - The ID of the service provider to update the response for
 * @param responseStatus - The status of the response
 * @param responseNotes - The notes of the response
 */
export async function updateProviderResponse(
	workflowRunId: string,
	serviceProviderId: string,
	responseStatus: string,
	responseNotes?: string,
): Promise<void> {
	await db
		.update(workflowProvider)
		.set({
			hasResponded: true,
			responseStatus,
			responseTime: new Date(),
			responseNotes,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(workflowProvider.workflowRunId, workflowRunId),
				eq(workflowProvider.serviceProviderId, serviceProviderId),
			),
		);
}

/**
 * Update provider quote
 * @param workflowRunId - The ID of the workflow run to update the provider quote for
 * @param serviceProviderId - The ID of the service provider to update the quote for
 * @param quoteAmount - The amount of the quote
 * @param quoteNotes - The notes of the quote
 */
export async function updateProviderQuote(
	workflowRunId: string,
	serviceProviderId: string,
	quoteAmount: number,
	quoteNotes?: string,
): Promise<void> {
	await db
		.update(workflowProvider)
		.set({
			hasQuoted: true,
			quoteAmount,
			quoteTime: new Date(),
			quoteNotes,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(workflowProvider.workflowRunId, workflowRunId),
				eq(workflowProvider.serviceProviderId, serviceProviderId),
			),
		);
}

// FIXME: Update provider response with full response details
export async function updateProviderResponseWithDetails(
	workflowRunId: string,
	serviceProviderId: string,
	responseStatus: string,
	responseNotes?: string,
	responseDetails?: any,
): Promise<void> {
	await db
		.update(workflowProvider)
		.set({
			hasResponded: true,
			responseStatus,
			responseTime: new Date(),
			responseNotes,
			response: responseDetails,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(workflowProvider.workflowRunId, workflowRunId),
				eq(workflowProvider.serviceProviderId, serviceProviderId),
			),
		);
}

/**
 * Update provider link
 * @param serviceProviderId - The ID of the service provider to update the link for
 * @param workflowRunId - The ID of the workflow run to update the link for
 * @param providerLinkHash - The hash of the provider link
 * @param encryptedLinkData - The encrypted link data
 * @param linkExpiresAt - The expiration date of the link
 */
export async function updateProviderLink(
	serviceProviderId: string,
	workflowRunId: string,
	providerLinkHash: string,
	encryptedLinkData: string,
	linkExpiresAt: Date,
): Promise<void> {
	await db
		.update(workflowProvider)
		.set({
			providerLinkHash,
			linkEncryptedData: encryptedLinkData,
			linkExpiresAt: linkExpiresAt,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(workflowProvider.serviceProviderId, serviceProviderId),
				eq(workflowProvider.workflowRunId, workflowRunId),
			),
		);
}

/**
 * Get workflow provider link data
 * @param linkHash - The hash of the provider link
 * @returns The workflow provider link data
 */
export async function getWorkflowProviderLinkData(linkHash: string) {
	return db
		.select({
			id: workflowProvider.id,
			workflowRunId: workflowProvider.workflowRunId,
			linkEncryptedData: workflowProvider.linkEncryptedData,
			linkExpiresAt: workflowProvider.linkExpiresAt,
		})
		.from(workflowProvider)
		.where(eq(workflowProvider.providerLinkHash, linkHash))
		.limit(1);
}

/**
 * Get workflow providers by ids
 * @param workflowRunId - The workflow run id
 * @param workflowProviderIds - The workflow provider ids
 * @returns The workflow providers
 */
export async function getWorkflowProvidersByIdsLazy(
	workflowRunId: string,
	workflowProviderIds: string[],
) {
	if (workflowProviderIds.length === 0) return [];

	return db
		.select({
			id: workflowProvider.id,
			workflowProviderId: workflowProvider.id,
			providerId: workflowProvider.serviceProviderId,
			quoteAmount: workflowProvider.quoteAmount,
			responseNote: workflowProvider.responseNotes,
			responseTime: workflowProvider.quoteTime,
			status: workflowProvider.responseStatus,
			providerName: serviceProvider.name,
			providerRating: serviceProvider.reputation,
			providerReliability: serviceProvider.responseTime,
		})
		.from(workflowProvider)
		.innerJoin(serviceProvider, eq(workflowProvider.serviceProviderId, serviceProvider.id))
		.where(
			and(
				eq(workflowProvider.workflowRunId, workflowRunId),
				inArray(workflowProvider.id, workflowProviderIds),
			),
		)
		.orderBy(asc(workflowProvider.createdAt));
}

/**
 * Get workflow providers by ids
 * @param workflowRunId - The workflow run id
 * @param workflowProviderIds - The workflow provider ids
 * @returns The workflow providers
 */
export async function getWorkflowProvidersByIds(
	workflowRunId: string,
	workflowProviderIds: string[],
) {
	return db
		.select()
		.from(workflowProvider)
		.where(
			and(
				eq(workflowProvider.workflowRunId, workflowRunId),
				inArray(workflowProvider.id, workflowProviderIds),
			),
		);
}
