import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { WorkflowStep, workflowStep } from "@/db/schema";

/**
 * Initialize workflow steps for a workflow run
 * @param workflowRunId - The ID of the workflow run to initialize the steps for
 * @returns The initialized workflow steps
 */
export async function initializeWorkflowSteps(workflowRunId: string): Promise<WorkflowStep[]> {
	const steps = [
		{ stepNumber: 1, stepName: "Request" },
		{ stepNumber: 2, stepName: "Message" },
		{ stepNumber: 3, stepName: "Notification" },
		{ stepNumber: 4, stepName: "Providers" },
		{ stepNumber: 5, stepName: "Quotes" },
		{ stepNumber: 6, stepName: "User Response" },
		{ stepNumber: 7, stepName: "Confirmation" },
		{ stepNumber: 8, stepName: "Complete" },
	];

	const insertData = steps.map((step) => ({
		workflowRunId,
		stepNumber: step.stepNumber,
		stepName: step.stepName,
		status: step.stepNumber === 1 ? "in-progress" : "pending",
		startedAt: step.stepNumber === 1 ? new Date() : null,
	}));

	const createdSteps = await db.insert(workflowStep).values(insertData).returning();
	return createdSteps;
}

/**
 * Get workflow steps for a workflow run
 * @param workflowRunId - The ID of the workflow run to get the steps for
 * @returns The workflow steps
 */
export async function getWorkflowStepsByWorkflowRunId(
	workflowRunId: string,
): Promise<WorkflowStep[]> {
	return db
		.select()
		.from(workflowStep)
		.where(eq(workflowStep.workflowRunId, workflowRunId))
		.orderBy(workflowStep.stepNumber);
}

/**
 * Update workflow step status
 * @param workflowRunId - The ID of the workflow run to update the step for
 * @param stepName - The name of the step to update
 * @param status - The status to update the step with
 * @param errorMessage - The error message to update the step with
 */
export async function updateWorkflowStepStatus(
	workflowRunId: string,
	stepName: string,
	status: string,
	errorMessage?: string,
): Promise<void> {
	const updateData: Partial<WorkflowStep> = {
		status,
		updatedAt: new Date(),
	};

	if (status === "in-progress" && !updateData.startedAt) {
		updateData.startedAt = new Date();
	}

	if (status === "completed") {
		updateData.completedAt = new Date();
	}

	if (errorMessage) {
		updateData.errorMessage = errorMessage;
		updateData.retryCount = (updateData.retryCount || 0) + 1;
	}

	await db
		.update(workflowStep)
		.set(updateData)
		.where(and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, stepName)));
}

/**
 * Update step with request details
 * @param workflowRunId - The ID of the workflow run to update the step for
 * @param originalMessage - The original message to update the step with
 * @param customerContact - The customer contact to update the step with
 */
export async function updateRequestStep(
	workflowRunId: string,
	originalMessage: string,
	customerContact: string,
): Promise<void> {
	await db
		.update(workflowStep)
		.set({
			originalMessage,
			customerContact,
			status: "completed",
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, "Request")),
		);
}

/**
 * Update step with enhanced message
 * @param workflowRunId - The ID of the workflow run to update the step for
 * @param enhancedMessage - The enhanced message to update the step with
 */
export async function updateMessageStep(
	workflowRunId: string,
	enhancedMessage: string,
): Promise<void> {
	await db
		.update(workflowStep)
		.set({
			enhancedMessage,
			status: "completed",
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(
			and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, "Message")),
		);
}

/**
 * Update step with generic details
 * @param workflowRunId - The ID of the workflow run to update the step for
 * @param stepName - The name of the step to update
 * @param details - The details to update the step with
 */
export async function updateStepDetails(
	workflowRunId: string,
	stepName: string,
	details: any,
): Promise<void> {
	await db
		.update(workflowStep)
		.set({
			details,
			updatedAt: new Date(),
		})
		.where(and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, stepName)));
}

/**
 * Set the wait time for a step
 * @param workflowRunId - The ID of the workflow run to set the wait time for
 * @param stepName - The name of the step to set the wait time for
 * @param waitTime - The wait time to set for the step
 */
export async function setStepWaitTime(
	workflowRunId: string,
	stepName: string,
	waitTime: string,
): Promise<void> {
	await db
		.update(workflowStep)
		.set({
			waitTime,
			updatedAt: new Date(),
		})
		.where(and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, stepName)));
}

/**
 * Mark a step as failed
 * @param workflowRunId - The ID of the workflow run to mark the step as failed
 * @param stepName - The name of the step to mark as failed
 * @param errorMessage - The error message to mark the step as failed
 */
export async function markStepAsFailed(
	workflowRunId: string,
	stepName: string,
	errorMessage: string,
): Promise<void> {
	await db
		.update(workflowStep)
		.set({
			status: "failed",
			errorMessage,
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(and(eq(workflowStep.workflowRunId, workflowRunId), eq(workflowStep.stepName, stepName)));
}
