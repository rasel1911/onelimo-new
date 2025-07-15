import { createWorkflowNotifications } from "@/db/queries/workflow/workflowNotification.queries";
import {
	createWorkflowProviders,
	getWorkflowProviderLinkData,
	updateProviderLink,
} from "@/db/queries/workflow/workflowProvider.queries";
import { BookingRequest, ServiceProvider, WorkflowProvider } from "@/db/schema";
import { BookingAnalysis } from "@/lib/ai/services/bookingAnalyzer";
import {
	ProviderLinkData,
	ProviderNotificationBatchResult,
} from "@/lib/workflow/types/communication";
import {
	ProviderContactData,
	NotificationRecord,
	StoreContactsResult,
	CONTACT_STATUS,
	RESPONSE_STATUS,
} from "@/lib/workflow/types/notification";

import { decodeProviderLinkFromData, isLinkExpired } from "../algorithms/linkGenerator";
import { findMatchingServiceProviders } from "../algorithms/providerMatcher";
import { notificationService } from "../communication/communication-factory";
import { DEFAULT_WORKFLOW_CONFIG } from "../config";
import { WorkflowTrackingService } from "../services/workflowTrackingService";
import { DecodedProviderLink } from "../types/provider-link";

const createProviderContactData = (
	workflowRunId: string,
	providers: ServiceProvider[],
): ProviderContactData[] => {
	return providers.map((provider) => ({
		workflowRunId,
		serviceProviderId: provider.id,
		contactStatus: CONTACT_STATUS,
		responseStatus: RESPONSE_STATUS,
	}));
};

export const buildProviderMapping = (
	providers: ServiceProvider[],
	createdProviders: WorkflowProvider[],
): Map<string, string> => {
	const providerMap = new Map<string, string>();

	createdProviders.forEach((workflowProvider, index) => {
		const serviceProvider = providers[index];
		if (serviceProvider) {
			providerMap.set(serviceProvider.id, workflowProvider.id);
		}
	});

	return providerMap;
};

const createNotificationRecords = (
	workflowRunId: string,
	notificationResults: ProviderNotificationBatchResult,
	providerMap: Map<string, string>,
): NotificationRecord[] => {
	const notificationData: NotificationRecord[] = [];

	for (const result of notificationResults.results) {
		const workflowProviderId = providerMap.get(result.providerId);

		if (!workflowProviderId) {
			console.warn(`No workflow provider found for service provider ID: ${result.providerId}`);
			continue;
		}

		const notificationRecord: NotificationRecord = {
			workflowRunId,
			workflowProviderId,
			type: result.channel.type,
			recipient: result.channel.recipient,
			status: result.success ? "sent" : "failed",
			templateUsed: (result.channel.metadata?.templateUsed as string) || "",
			messageId: (result.channel.metadata?.messageId as string) || "",
			errorCode: result.errorCode,
			errorMessage: result.errorMessage,
			sentAt: result.timestamp,
			retryCount: 0,
			maxRetries: 3,
			hasResponse: false,
		};

		notificationData.push(notificationRecord);
	}

	return notificationData;
};

/**
 * Stores provider contacts and their notification results in the database
 *
 * @param workflowRunId - Unique identifier for the workflow run
 * @param providers - Array of service providers to contact
 * @param notificationResults - Results from the notification batch process
 * @returns Promise containing created providers and notifications
 * @throws Error if database operations fail
 */
export const storeNotificationResults = async (
	workflowRunId: string,
	providers: ServiceProvider[],
	workflowProviders: WorkflowProvider[],
	notificationResults: ProviderNotificationBatchResult,
): Promise<StoreContactsResult> => {
	if (!workflowRunId || !providers.length || !notificationResults.results.length) {
		throw new Error("Invalid input parameters for storing provider contacts");
	}

	try {
		const providerMap = buildProviderMapping(providers, workflowProviders);

		const notificationData = createNotificationRecords(
			workflowRunId,
			notificationResults,
			providerMap,
		);

		if (notificationData.length > 0) {
			await createWorkflowNotifications(notificationData);
		}

		return {
			providers: workflowProviders,
			notifications: notificationData,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error(`Failed to store provider contacts for workflow ${workflowRunId}:`, errorMessage);
		throw new Error(`Database operation failed: ${errorMessage}`);
	}
};

/**
 * Creates a provider link for a workflow
 * @param params - The parameters for creating the provider link
 * @returns Promise containing the generated link data
 * @throws Error when link creation fails
 */
export const createProviderLinkForWorkflow = async ({
	providerId,
	linkData,
	workflowRunId,
}: {
	providerId: string;
	linkData: ProviderLinkData;
	workflowRunId: string;
}): Promise<void> => {
	try {
		await updateProviderLink(
			providerId,
			workflowRunId,
			linkData.hash,
			linkData.encryptedData,
			linkData.expiresAt,
		);
	} catch (error) {
		console.error("Failed to create provider link:", error);
		throw new Error("Failed to generate provider link");
	}
};

/**
 * Validates a provider link by hash
 * @param hash - The hash of the provider link to validate
 * @returns Promise containing validation result
 */
export const validateProviderLink = async (
	hash: string,
): Promise<{
	isValid: boolean;
	isExpired?: boolean;
	linkData?: DecodedProviderLink;
}> => {
	const [linkRecord] = await getWorkflowProviderLinkData(hash);

	if (!linkRecord?.linkEncryptedData || !linkRecord?.linkExpiresAt) {
		return { isValid: false };
	}

	try {
		const decodedLinkData = await decodeProviderLinkFromData(linkRecord.linkEncryptedData);
		return {
			isValid: true,
			isExpired: isLinkExpired(linkRecord.linkExpiresAt),
			linkData: decodedLinkData,
		};
	} catch {
		return { isValid: false };
	}
};

/**
 * Runs the notification step
 * @param workflowRunId - Unique identifier for the workflow run
 * @param bookingRequest - Booking request object
 * @returns Promise containing created providers and notifications
 * @throws Error if database operations fail
 */
export const runNotificationStep = async (
	workflowRunId: string,
	bookingRequest: BookingRequest,
	analysis: BookingAnalysis,
) => {
	await WorkflowTrackingService.updateWorkflowStatusAndStep(
		workflowRunId,
		"sending_notifications",
		"Notification",
		3,
	);

	let endWorkflow = false;

	// FIXME: Find matching service providers
	const matchingProviders = await findMatchingServiceProviders(
		bookingRequest,
		DEFAULT_WORKFLOW_CONFIG.maxProvidersToContact,
	);

	if (matchingProviders.length === 0) {
		endWorkflow = true;
	}

	const providers = matchingProviders.map((match) => match.serviceProvider);
	const providerData = createProviderContactData(workflowRunId, providers);
	const workflowProviders = await createWorkflowProviders(providerData);

	const notificationResults = await notificationService.sendProviderNotifications(
		{
			bookingRequest,
			providers,
			workflowProviders,
			analysis,
		},
		workflowRunId,
	);

	await storeNotificationResults(workflowRunId, providers, workflowProviders, notificationResults);
	await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Notification");

	return {
		providers,
		workflowProvidersIds: workflowProviders.map((provider) => provider.id),
		notificationResults,
		endWorkflow,
	};
};
