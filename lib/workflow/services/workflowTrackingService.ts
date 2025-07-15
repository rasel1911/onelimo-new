import { getWorkflowTrackingDataOptimized } from "@/db/queries/workflow";
import { getNotificationSummary } from "@/db/queries/workflow/workflowNotification.queries";
import {
	completeWorkflow,
	initializeWorkflowRun,
	markWorkflowAsFailed,
	updateWorkflowStatus,
} from "@/db/queries/workflow/workflowRun.queries";
import {
	initializeWorkflowSteps,
	markStepAsFailed,
	setStepWaitTime,
	updateStepDetails,
	updateWorkflowStepStatus,
} from "@/db/queries/workflow/workflowStep.queries";

import type {
	WorkflowStep,
	WorkflowProvider,
	WorkflowQuote,
	WorkflowNotification,
} from "@/db/schema";

export class WorkflowTrackingService {
	/**
	 * Get workflow tracking data with summary
	 * @param workflowRunId - The ID of the workflow run
	 * @returns The workflow tracking data with summary
	 */
	static async getWorkflowTrackingDataWithSummary(workflowRunId: string) {
		try {
			const optimizedData = await getWorkflowTrackingDataOptimized(workflowRunId);

			if (!optimizedData) {
				throw new Error(`Workflow run not found: ${workflowRunId}`);
			}

			const { workflowRun, steps, providers, quotes, notifications } = optimizedData;

			const providerStats = {
				totalContacted: providers.length,
				totalResponded: providers.filter((p: WorkflowProvider) => p.hasResponded).length,
				totalQuoted: providers.filter((p: WorkflowProvider) => p.hasQuoted).length,
				responseRate:
					providers.length > 0
						? (providers.filter((p: WorkflowProvider) => p.hasResponded).length /
								providers.length) *
							100
						: 0,
				quoteRate:
					providers.length > 0
						? (providers.filter((p: WorkflowProvider) => p.hasQuoted).length / providers.length) *
							100
						: 0,
			};

			const acceptedQuotes = quotes.filter((q: WorkflowQuote) => q.status === "accepted");
			const acceptedAmounts = acceptedQuotes
				.filter((q: WorkflowQuote) => q.amount !== null)
				.map((q: WorkflowQuote) => q.amount!);

			const quoteStats = {
				totalQuotes: quotes.length,
				acceptedQuotes: acceptedQuotes.length,
				declinedQuotes: quotes.filter((q: WorkflowQuote) => q.status === "declined").length,
				averageAmount:
					acceptedAmounts.length > 0
						? acceptedAmounts.reduce((sum: number, amount: number) => sum + amount, 0) /
							acceptedAmounts.length
						: 0,
				lowestAmount: acceptedAmounts.length > 0 ? Math.min(...acceptedAmounts) : 0,
				highestAmount: acceptedAmounts.length > 0 ? Math.max(...acceptedAmounts) : 0,
				acceptanceRate: quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0,
			};

			const emailNotifications = notifications.filter(
				(n: WorkflowNotification) => n.type === "email",
			);
			const sentCount = notifications.filter((n: WorkflowNotification) =>
				["sent", "delivered", "opened", "clicked"].includes(n.status),
			).length;
			const deliveredCount = notifications.filter((n: WorkflowNotification) =>
				["delivered", "opened", "clicked"].includes(n.status),
			).length;
			const openedCount = notifications.filter(
				(n: WorkflowNotification) => n.openedAt !== null,
			).length;
			const responseCount = notifications.filter((n: WorkflowNotification) => n.hasResponse).length;

			const notificationStats = {
				totalNotifications: notifications.length,
				emailNotifications: emailNotifications.length,
				smsNotifications: notifications.filter((n: WorkflowNotification) => n.type === "sms")
					.length,
				sentCount,
				deliveredCount,
				openedCount,
				clickedCount: 0,
				failedCount: notifications.filter((n: WorkflowNotification) => n.status === "failed")
					.length,
				responseCount,
				deliveryRate: notifications.length > 0 ? (deliveredCount / notifications.length) * 100 : 0,
				openRate:
					emailNotifications.length > 0 ? (openedCount / emailNotifications.length) * 100 : 0,
				clickRate: 0,
				responseRate: notifications.length > 0 ? (responseCount / notifications.length) * 100 : 0,
			};

			return {
				workflowRun,
				steps,
				providers,
				quotes,
				notifications,
				statistics: {
					providers: providerStats,
					quotes: quoteStats,
					notifications: notificationStats,
				},
			};
		} catch (error) {
			console.error("Failed to get optimized workflow tracking data:", error);
			throw error;
		}
	}

	/**
	 * Initialize a workflow
	 * @param workflowRunId - The ID of the workflow run
	 * @param bookingRequestId - The ID of the booking request
	 * @param userId - The ID of the user
	 * @param customerName - The name of the customer
	 * @param customerEmail - The email of the customer
	 * @param customerPhone - The phone number of the customer
	 * @returns The workflow run
	 */
	static async initializeWorkflow(
		workflowRunId: string,
		bookingRequestId: string,
		userId: string,
		customerName?: string,
		customerEmail?: string,
		customerPhone?: string,
	) {
		try {
			const workflowRun = await initializeWorkflowRun(
				workflowRunId,
				bookingRequestId,
				userId,
				customerName,
				customerEmail,
				customerPhone,
			);

			const steps = await initializeWorkflowSteps(workflowRunId);

			return { workflowRun, steps };
		} catch (error) {
			console.error("Failed to initialize workflow:", error);
			throw error;
		}
	}

	/**
	 * Update the workflow status and step
	 * @param workflowRunId - The ID of the workflow run
	 * @param status - The status of the workflow
	 * @param currentStep - The current step of the workflow
	 * @param stepNumber - The number of the step
	 */
	static async updateWorkflowStatusAndStep(
		workflowRunId: string,
		status: string,
		currentStep: string,
		stepNumber: number,
	) {
		try {
			await updateWorkflowStatus(workflowRunId, status, currentStep, stepNumber);
			await updateWorkflowStepStatus(workflowRunId, currentStep, "in-progress");

			console.log(`📊 Workflow ${workflowRunId} updated: ${status} - ${currentStep}`);
		} catch (error) {
			console.error("Failed to update workflow status:", error);
			throw error;
		}
	}

	/**
	 * Complete a workflow step
	 * @param workflowRunId - The ID of the workflow run
	 * @param stepName - The name of the step
	 * @param details - The details of the step
	 */
	static async completeWorkflowStep(workflowRunId: string, stepName: string, details?: any) {
		try {
			await updateWorkflowStepStatus(workflowRunId, stepName, "completed");

			if (details) {
				await updateStepDetails(workflowRunId, stepName, details);
			}

			console.log(`✅ Step completed: ${stepName} for workflow ${workflowRunId}`);
		} catch (error) {
			console.error(`Failed to complete step ${stepName}:`, error);
			throw error;
		}
	}

	/**
	 * Complete a workflow run
	 * @param workflowRunId - The ID of the workflow run
	 */
	static async completeWorkflowRun(workflowRunId: string) {
		try {
			await completeWorkflow(workflowRunId);
			await updateWorkflowStepStatus(workflowRunId, "Complete", "completed");

			console.log(`🎉 Workflow completed: ${workflowRunId}`);
		} catch (error) {
			console.error("Failed to complete workflow:", error);
			throw error;
		}
	}

	/**
	 * Fail a workflow
	 * @param workflowRunId - The ID of the workflow run
	 * @param currentStep - The current step of the workflow
	 * @param errorMessage - The error message
	 */
	static async failWorkflow(workflowRunId: string, currentStep: string, errorMessage: string) {
		try {
			await markWorkflowAsFailed(workflowRunId, errorMessage);
			await markStepAsFailed(workflowRunId, currentStep, errorMessage);

			console.log(`❌ Workflow failed: ${workflowRunId} - ${errorMessage}`);
		} catch (error) {
			console.error("Failed to mark workflow as failed:", error);
			throw error;
		}
	}

	/**
	 * Set the wait time for a step
	 * @param workflowRunId - The ID of the workflow run
	 * @param stepName - The name of the step
	 * @param waitTime - The wait time
	 */
	static async setStepWaitTime(workflowRunId: string, stepName: string, waitTime: string) {
		try {
			await setStepWaitTime(workflowRunId, stepName, waitTime);
			console.log(`⏰ Wait time set for ${stepName}: ${waitTime}`);
		} catch (error) {
			console.error("Failed to set step wait time:", error);
			throw error;
		}
	}

	/**
	 * Get comprehensive workflow data for tracking UI
	 * @param workflowRunId - The ID of the workflow run
	 * @returns The workflow tracking data
	 */
	static async getWorkflowTrackingData(workflowRunId: string) {
		try {
			const optimizedData =
				await WorkflowTrackingService.getWorkflowTrackingDataWithSummary(workflowRunId);

			const { workflowRun, steps, providers, quotes, notifications, statistics } = optimizedData;

			const allStepNames = [
				"Request",
				"Message",
				"Notification",
				"Providers",
				"Quotes",
				"User Response",
				"Confirmation",
				"Complete",
			];

			const stepMap = new Map();
			steps.forEach((step: WorkflowStep) => {
				stepMap.set(step.stepName, step);
			});

			const notificationSummary = await getNotificationSummary(workflowRunId);

			const formattedSteps = allStepNames.map((stepName, index) => {
				const step = stepMap.get(stepName);
				const stepNumber = index + 1;

				let status = "pending";
				let timestamp = undefined;

				if (step) {
					status = step.status;
					if (step.status === "completed" && step.completedAt) {
						timestamp = step.completedAt.toISOString();
					} else if (step.status === "in-progress" && step.startedAt) {
						timestamp = step.startedAt.toISOString();
					} else if (step.startedAt) {
						timestamp = step.startedAt.toISOString();
					}
				} else if (workflowRun.currentStepNumber > stepNumber) {
					status = "completed";
					const estimatedTime = new Date(workflowRun.startedAt);
					estimatedTime.setMinutes(estimatedTime.getMinutes() + stepNumber * 2);
					timestamp = estimatedTime.toISOString();
				} else if (workflowRun.currentStepNumber === stepNumber) {
					status = "in-progress";
					timestamp = workflowRun.updatedAt?.toISOString() || new Date().toISOString();
				}

				let enhancedDetails = step?.details;
				if (stepName === "Message") {
					if (workflowRun.bookingAnalysis) {
						enhancedDetails = {
							analysis: workflowRun.bookingAnalysis,
						};
					}
				} else if (stepName === "Notification") {
					enhancedDetails = {
						...step?.details,
						notificationSummary,
						workflowRunId,
					};
				}

				const formattedStep = {
					id: stepNumber,
					name: stepName,
					status: status,
					timestamp: timestamp,
					details: enhancedDetails,
					providers: stepName === "Providers" ? providers : undefined,
					quotes:
						stepName === "Quotes"
							? quotes.filter((q: WorkflowQuote) => q.status === "accepted")
							: undefined,
					waitTime: step?.waitTime || undefined,
				};

				return formattedStep;
			});

			return {
				id: workflowRun.bookingRequestId,
				customer: workflowRun.customerName || "Customer",
				date: workflowRun.startedAt.toISOString(),
				status: workflowRun.status,
				currentStep: workflowRun.currentStepNumber,
				steps: formattedSteps,
				rawData: {
					workflowRun,
					steps,
					providers,
					quotes,
					notifications,
					statistics,
				},
			};
		} catch (error) {
			console.error("Failed to get workflow tracking data:", error);
			throw error;
		}
	}
}
