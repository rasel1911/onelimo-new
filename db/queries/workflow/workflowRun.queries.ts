import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
	InsertWorkflowRun,
	WorkflowRun,
	workflowRun,
	type QuoteAnalysis,
	ConfirmationAnalysis,
} from "@/db/schema/workflow/workflowRun.schema";

import type { ResponseComparisonAnalysis } from "@/lib/ai/services/responseAnalyzer";

/**
 * Create a workflow run
 * @param data - The data to create the workflow run with
 * @returns The created workflow run
 */
export const createWorkflowRun = async (data: InsertWorkflowRun): Promise<WorkflowRun> => {
	const [newWorkflowRun] = await db.insert(workflowRun).values(data).returning();
	return newWorkflowRun;
};

/**
 * Initialize a workflow run
 * @param workflowRunId - The ID of the workflow run to initialize
 * @param bookingRequestId - The ID of the booking request to initialize the workflow run with
 * @param userId - The ID of the user to initialize the workflow run with
 * @param customerName - The name of the customer to initialize the workflow run with
 * @param customerEmail - The email of the customer to initialize the workflow run with
 * @param customerPhone - The phone number of the customer to initialize the workflow run with
 * @returns The initialized workflow run
 */
export const initializeWorkflowRun = async (
	workflowRunId: string,
	bookingRequestId: string,
	userId: string,
	customerName?: string,
	customerEmail?: string,
	customerPhone?: string,
): Promise<WorkflowRun> => {
	const data: InsertWorkflowRun = {
		workflowRunId,
		bookingRequestId,
		userId,
		customerName,
		customerEmail,
		customerPhone,
		status: "analyzing",
		currentStep: "Request",
		currentStepNumber: 1,
	};

	return createWorkflowRun(data);
};

/**
 * Get a workflow run by its ID
 * @param workflowRunId - The ID of the workflow run to get
 * @returns The workflow run
 */
export const getWorkflowRunByWorkflowRunId = async (
	workflowRunId: string,
): Promise<WorkflowRun | null> => {
	const result = await db
		.select()
		.from(workflowRun)
		.where(eq(workflowRun.workflowRunId, workflowRunId))
		.limit(1);

	return result[0];
};

/**
 * Update workflow status
 * @param workflowRunId - The ID of the workflow run to update
 * @param status - The new status of the workflow run
 * @param currentStep - The current step of the workflow run
 * @param stepNumber - The number of the current step of the workflow run
 */
export const updateWorkflowStatus = async (
	workflowRunId: string,
	status: string,
	currentStep?: string,
	stepNumber?: number,
): Promise<void> => {
	const updateData: Partial<WorkflowRun> = {
		status,
		updatedAt: new Date(),
	};

	if (currentStep) {
		updateData.currentStep = currentStep;
	}

	if (stepNumber) {
		updateData.currentStepNumber = stepNumber;
	}

	await db.update(workflowRun).set(updateData).where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Update workflow with booking analysis
 * @param workflowRunId - The ID of the workflow run to update
 * @param bookingAnalysis - The booking analysis data
 */
export const updateWorkflowWithAnalysis = async (
	workflowRunId: string,
	bookingAnalysis: any,
): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			bookingAnalysis,
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Complete workflow
 * @param workflowRunId - The ID of the workflow run to complete
 */
export const completeWorkflow = async (workflowRunId: string): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			status: "completed",
			currentStep: "Complete",
			currentStepNumber: 8,
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Mark workflow as failed
 * @param workflowRunId - The ID of the workflow run to mark as failed
 * @param errorMessage - The error message to mark the workflow as failed
 */
export const markWorkflowAsFailed = async (
	workflowRunId: string,
	errorMessage?: string,
): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			status: "failed",
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Get all workflow runs for a user
 * @param userId - The ID of the user to get the workflow runs for
 * @returns An array of workflow runs
 */
export const getWorkflowRunsByUserId = async (userId: string): Promise<WorkflowRun[]> => {
	console.log("getWorkflowRunsByUserId", userId);
	return db
		.select()
		.from(workflowRun)
		.where(eq(workflowRun.userId, userId))
		.orderBy(desc(workflowRun.startedAt));
};

/**
 * Get recent workflow runs
 * @param limit - The number of workflow runs to get
 * @returns An array of workflow runs
 */
export const getRecentWorkflowRuns = async (limit: number = 10): Promise<WorkflowRun[]> => {
	return db.select().from(workflowRun).orderBy(desc(workflowRun.startedAt)).limit(limit);
};

// ================================
// QUOTE RELATED QUERIES
// ================================
/**
 * Update workflow run with quotes link data
 * @param workflowRunId - The ID of the workflow run to update
 * @param hash - The quotes hash
 * @param encryptedData - The encrypted data
 * @param expiresAt - The expiration date
 */
export const updateWorkflowQuotesLink = async (
	workflowRunId: string,
	hash: string,
	encryptedData: string,
	expiresAt: Date,
): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			quotesHash: hash,
			quotesEncryptedData: encryptedData,
			quotesExpiresAt: expiresAt,
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Update workflow run with quote analysis data
 * @param workflowRunId - The ID of the workflow run to update
 * @param analysisResults - The analysis results to update the workflow run with
 * @returns The updated workflow run
 */
export const updateWorkflowRunWithQuoteAnalysis = async (
	workflowRunId: string,
	analysisResults: ResponseComparisonAnalysis,
): Promise<WorkflowRun | null> => {
	try {
		const quoteAnalysis: QuoteAnalysis = {
			totalQuotes: analysisResults.totalQuotes,
			acceptedQuotes: analysisResults.acceptedQuotes,
			declinedQuotes: analysisResults.declinedQuotes,
			averageViability: analysisResults.averageViability,
			averageSeriousness: analysisResults.averageSeriousness,
			averageProfessionalism: analysisResults.averageProfessionalism,
			marketOverview: {
				competitionLevel: analysisResults.marketOverview.competitionLevel,
				responseQuality: analysisResults.marketOverview.responseQuality,
				priceRange: {
					min: analysisResults.marketOverview.priceRange.min,
					max: analysisResults.marketOverview.priceRange.max,
					average: analysisResults.marketOverview.priceRange.average,
				},
			},
			averageScore: analysisResults.recommendations.averageScore,
			marketInsights: analysisResults.recommendations.marketInsights,
			selectionStrategy: analysisResults.recommendations.selectionStrategy,
			confidenceLevel: analysisResults.recommendations.confidenceLevel,
		};

		const [updatedWorkflowRun] = await db
			.update(workflowRun)
			.set({
				responseAnalysis: quoteAnalysis,
				totalQuotesReceived: analysisResults.totalQuotes,
				updatedAt: new Date(),
			})
			.where(eq(workflowRun.workflowRunId, workflowRunId))
			.returning();

		if (!updatedWorkflowRun) {
			console.warn(`⚠️ No workflow run found for analysis update: ${workflowRunId}`);
			return null;
		}

		console.log(`✅ Updated workflow run ${workflowRunId} with quote analysis data`);
		return updatedWorkflowRun;
	} catch (error) {
		console.error("❌ Failed to update workflow run with quote analysis:", error);
		throw new Error(
			`Failed to update workflow run analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};

/**
 * Get workflow run data by quotes hash
 * @param quotesHash - The quotes hash to get the workflow run data for
 * @returns The workflow run data with encrypted data for decoding
 */
export const getWorkflowRunByQuotesHash = async (
	quotesHash: string,
): Promise<WorkflowRun | null> => {
	const result = await db
		.select()
		.from(workflowRun)
		.where(eq(workflowRun.quotesHash, quotesHash))
		.limit(1);

	return result[0] || null;
};

/**
 * Update workflow run with selected quote details
 * @param workflowRunId - The ID of the workflow run to update
 * @param selectedProviderId - The ID of the selected provider
 * @param selectedQuoteId - The ID of the selected quote
 * @param selectedQuoteAmount - The amount of the selected quote
 * @param selectedQuoteMessage - The confirmation message from the user
 */
export const updateWorkflowRunWithSelectedQuote = async (
	workflowRunId: string,
	selectedProviderId: string,
	selectedQuoteId: string,
	selectedQuoteAmount: number,
	selectedQuoteMessage: string,
	action: "confirm" | "question",
): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			selectedProviderId,
			selectedQuoteId,
			selectedQuoteAmount,
			selectedQuoteMessage,
			selectedQuoteAction: action,
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};

/**
 * Get selected quote details from workflow run
 * @param workflowRunId - The ID of the workflow run
 * @returns The selected quote details or null if not found
 */
export const getSelectedQuoteDetails = async (
	workflowRunId: string,
): Promise<{
	quoteId: string;
	providerId: string;
	amount: number;
	message: string;
	action: string;
} | null> => {
	const result = await db
		.select({
			selectedQuoteId: workflowRun.selectedQuoteId,
			selectedProviderId: workflowRun.selectedProviderId,
			selectedQuoteAmount: workflowRun.selectedQuoteAmount,
			selectedQuoteMessage: workflowRun.selectedQuoteMessage,
			selectedQuoteAction: workflowRun.selectedQuoteAction,
		})
		.from(workflowRun)
		.where(eq(workflowRun.workflowRunId, workflowRunId))
		.limit(1);

	const data = result[0];
	if (!data || !data.selectedQuoteId || !data.selectedProviderId) {
		return null;
	}

	return {
		quoteId: data.selectedQuoteId,
		providerId: data.selectedProviderId,
		amount: data.selectedQuoteAmount || 0,
		message: data.selectedQuoteMessage || "",
		action: data.selectedQuoteAction || "",
	};
};

/**
 * Update workflow run with confirmation analysis
 * @param workflowRunId - The ID of the workflow run to update
 * @param confirmationAnalysis - The confirmation analysis data
 */
export const updateWorkflowWithConfirmationAnalysis = async (
	workflowRunId: string,
	confirmationAnalysis: ConfirmationAnalysis,
): Promise<void> => {
	await db
		.update(workflowRun)
		.set({
			confirmationAnalysis,
			updatedAt: new Date(),
		})
		.where(eq(workflowRun.workflowRunId, workflowRunId));
};
