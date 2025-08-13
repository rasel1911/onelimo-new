import { serve } from "@upstash/workflow/nextjs";

import { getSettingsByCategory } from "@/db/queries/settings.queries";
import { getWorkflowRunByWorkflowRunId } from "@/db/queries/workflow/workflowRun.queries";
import { WorkflowSettings } from "@/db/schema/settings.schema";
import { analyzeBookingRequestInWorkflow } from "@/lib/ai/services/bookingAnalyzer";
import { WorkflowTrackingService } from "@/lib/workflow/services/workflowTrackingService";
import { runAnalyzeMessageStep } from "@/lib/workflow/steps/analyzeMessageStep";
import { analyzeQuotesStep } from "@/lib/workflow/steps/analyzeQuotesStep";
import { runBookingRequestStep } from "@/lib/workflow/steps/bookingRequestStep";
import { runConfirmationStep } from "@/lib/workflow/steps/confirmationStep";
import { runNotificationStep } from "@/lib/workflow/steps/notificationStep";
import { runUserResponseStep } from "@/lib/workflow/steps/userResponseStep";
import { BookingWorkflowPayload } from "@/lib/workflow/types";
import { checkProviderResponses } from "@/lib/workflow/utils/responseChecker";
import { runMessageStep } from "@/lib/workflow/steps/communicationStep";

export const { POST } = serve<BookingWorkflowPayload>(async (context) => {
	const workflowSettings = (await getSettingsByCategory("workflow")) as WorkflowSettings;

	const PROVIDER_RESPONSE_TIMEOUT_HOURS = workflowSettings.responseTimeoutMinutes / 60;
	const MIN_RESPONSES_REQUIRED = workflowSettings.minResponsesRequired;
	const RESPONSE_CHECK_POLLING_INTERVAL = workflowSettings.responseCheckIntervalMinutes * 60 * 1000; // Convert minutes to milliseconds

	const { bookingRequestId, user } = context.requestPayload;
	const workflowRunId = context.workflowRunId;

	/****************************************************
	 * [STEP 1] Initialize workflow
	 ****************************************************/
	await context.run("initialize-workflow", async () => {
		const { workflowRun, steps } = await WorkflowTrackingService.initializeWorkflow(
			workflowRunId,
			bookingRequestId,
			user.id,
			user.name,
			user.email,
			user.phone,
		);
		console.log(`⚙️ Workflow initialized: ${workflowRun.id} with ${steps.length} steps`);

		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"analyzing",
			"Request",
			1,
		);
		return { initialized: true };
	});

	/****************************************************
	 * [STEP 2] Analyze booking request
	 ****************************************************/
	const { bookingRequest } = await context.run("get-booking-request", async () => {
		console.log(`📊 [STEP 2.1]: Processing booking request ${bookingRequestId}`);
		return await runBookingRequestStep(workflowRunId, bookingRequestId, user);
	});

	console.log(`📊 [STEP 2.2]: Analyzing booking request ${bookingRequestId}`);
	const analysis = await analyzeBookingRequestInWorkflow(bookingRequest);

	await context.run("enhance-booking-message-with-ai", async () => {
		console.log(`🤖 [STEP 2.3]: Enhancing booking message with AI`);
		return await runAnalyzeMessageStep(workflowRunId, bookingRequest, analysis);
	});

	/****************************************************
	 * [STEP 3] Send booking notification to providers
	 ****************************************************/
	const { providers, workflowProvidersIds, endWorkflow } = await context.run(
		"send-booking-notification-to-providers",
		async () => {
			console.log(`📧 [STEP 3]: Finding providers and sending notifications`);
			const result = await runNotificationStep(workflowRunId, bookingRequest, analysis);

			await WorkflowTrackingService.updateWorkflowStatusAndStep(
				workflowRunId,
				"waiting_responses",
				"Providers",
				4,
			);
			return result;
		},
	);

	if (endWorkflow) {
		await WorkflowTrackingService.failWorkflow(
			workflowRunId,
			"Providers",
			"No matching service providers found",
		);
		return {
			status: "failed",
			message: "No matching service providers found",
			workflowRunId,
			bookingRequestId,
			selectedProvider: null,
			completedAt: new Date().toISOString(),
		};
	}

	/****************************************************
	 * [STEP 4] Wait for provider responses with timeout
	 ****************************************************/
	console.log(`👥 [STEP 4]: Tracking provider statuses`);
	const workflowRun = await getWorkflowRunByWorkflowRunId(workflowRunId);

	if (!workflowRun) {
		throw new Error(`Workflow run not found: ${workflowRunId}`);
	}

	const workflowStartTime = workflowRun.startedAt;
	const timeoutAt = new Date(
		workflowStartTime.getTime() + PROVIDER_RESPONSE_TIMEOUT_HOURS * 60 * 60 * 1000,
	);

	let checkCount = 0;
	const maxChecks = Math.floor(
		(PROVIDER_RESPONSE_TIMEOUT_HOURS * 3600) / (workflowSettings.responseCheckIntervalMinutes * 60),
	);

	while (new Date() < timeoutAt && checkCount < maxChecks) {
		checkCount++;
		console.log(`⏰ Check ${checkCount}/${maxChecks}: Polling provider responses...`);

		const checkResult = await context.run(`check-providers-response${checkCount}`, async () => {
			const result = await checkProviderResponses(workflowRunId, workflowProvidersIds);
			return {
				...result,
				timestamp: new Date().toISOString(),
				checkNumber: checkCount,
			};
		});

		if (checkResult.respondedCount >= MIN_RESPONSES_REQUIRED) {
			console.log(`✅ Target reached after ${checkCount} checks, proceeding!`);
			break;
		}

		const timeRemaining = timeoutAt.getTime() - new Date().getTime();
		const sleepDuration = Math.min(RESPONSE_CHECK_POLLING_INTERVAL, timeRemaining - 5000);

		if (sleepDuration <= 0) {
			console.log(`⏰ Timeout reached after ${checkCount} checks`);
			break;
		}

		await context.sleep(`wait-cycle-${checkCount}`, Math.floor(sleepDuration / 1000));
	}

	await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Providers", {
		providersContacted: providers.length,
	});

	if (new Date() > timeoutAt) {
		await WorkflowTrackingService.failWorkflow(
			workflowRunId,
			"Providers",
			"No matching service providers found",
		);
		return {
			status: "failed",
			message: "No matching service providers found",
			workflowRunId,
			bookingRequestId,
			selectedProvider: null,
			completedAt: new Date().toISOString(),
		};
	}

	/****************************************************
	 * [STEP 5] Analyze provider responses and send quotes
	 ****************************************************/
	console.log(`👥 [STEP 5]: Analyzing provider responses`);
	await context.run("analyze-provider-responses-and-send-quotes", async () => {
		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"analyzing_quotes",
			"Quotes",
			5,
		);
		return await analyzeQuotesStep(workflowRunId, bookingRequest, workflowProvidersIds);
	});

	/****************************************************
	 * [STEP 5.1] Wait for user quote selection with timeout
	 ****************************************************/
	console.log(`👤 [STEP 5.1]: Waiting for user quote selection`);
	const userSelectionTimeoutAt = new Date(workflowRun.quotesExpiresAt || new Date());
	const timeRemaining = userSelectionTimeoutAt.getTime() - new Date().getTime();

	const { eventData, timeout } = await context.waitForEvent(
		`wait-for-user-quote-selection`,
		`workflow-${workflowRunId}`,
		{
			timeout: Math.floor(timeRemaining / 1000),
		},
	);

	if (timeout) {
		console.log(`⏰ User selection timeout reached - ending workflow`);
		const currentWorkflowRun = await getWorkflowRunByWorkflowRunId(workflowRunId);

		const userHasSelected =
			currentWorkflowRun?.selectedQuoteId || currentWorkflowRun?.selectedProviderId;

		if (!userHasSelected) {
			await WorkflowTrackingService.failWorkflow(
				workflowRunId,
				"User Response",
				"User did not select a quote within the time limit",
			);
			return {
				status: "failed",
				message: "User did not select a quote within the time limit",
				workflowRunId,
				bookingRequestId,
				selectedProvider: null,
				completedAt: new Date().toISOString(),
			};
		}
	}

	/****************************************************
	 * [STEP 6] Analyze user response
	 ****************************************************/
	const { confirmationAnalysis, selectedQuoteDetails, provider } = await context.run(
		"analyze-user-response",
		async () => {
			console.log(`👤 [STEP 6]: Processing user quote selection`);

			return await runUserResponseStep(workflowRunId, bookingRequest);
		},
	);

	/****************************************************
	 * [STEP 6.1] Send booking confirmation or question
	 ****************************************************/
	const isWaitingForReply = await context.run("send-booking-question", async () => {
		const userAction = selectedQuoteDetails?.action;
		const userIntent = confirmationAnalysis?.intent || confirmationAnalysis?.userAction;

		if (!userAction?.includes("confirm") || !userIntent?.includes("confirm")) {
			console.log(`👤 [STEP 6.1]: Sending booking question`);
			// TODO: send booking question
			// show the question on the same booking request received page(same booking hash)
			// wait for reply
			if (!confirmationAnalysis || !selectedQuoteDetails || !provider) {
				throw new Error("Confirmation analysis, selected quote details, or provider not found");
			}

			return await runMessageStep({
				workflowRunId,
				bookingRequest,
				confirmationAnalysis,
				selectedQuoteDetails,
				provider,
			});
		}
	});

	if (isWaitingForReply) {
		await WorkflowTrackingService.failWorkflow(
			workflowRunId,
			"User Response",
			"User did not select a quote within the time limit",
		);
		return {
			status: "failed",
			message: "User did not select a quote within the time limit",
			workflowRunId,
			bookingRequestId,
			selectedProvider: null,
			completedAt: new Date().toISOString(),
		};
	}

	const { providerNotificationResult, customerNotificationResult } = await context.run(
		"send-booking-confirmation",
		async () => {
			console.log(`✅ [STEP 7]: Sending booking confirmations`);
			if (!confirmationAnalysis || !selectedQuoteDetails || !provider) {
				throw new Error("Confirmation analysis, selected quote details, or provider not found");
			}

			return await runConfirmationStep({
				workflowRunId,
				bookingRequest,
				confirmationAnalysis,
				selectedQuoteDetails,
				provider,
			});
		},
	);

	/****************************************************
	 * [STEP 8] Complete workflow
	 ****************************************************/
	const finalResult = await context.run("complete-workflow", async () => {
		console.log(`🏁 [STEP 8]: Completing booking workflow`);

		await WorkflowTrackingService.completeWorkflowRun(workflowRunId);
		await WorkflowTrackingService.updateWorkflowStatusAndStep(
			workflowRunId,
			"completed",
			"Complete",
			8,
		);
		await WorkflowTrackingService.completeWorkflowStep(workflowRunId, "Complete", {
			providerNotificationResult,
			customerNotificationResult,
		});

		console.log(`🎉 Booking workflow completed successfully for ${bookingRequestId}`);
		return {
			status: "completed" as const,
			workflowRunId,
			bookingRequestId,
			selectedProvider: null,
			completedAt: new Date().toISOString(),
		};
	});

	console.log(`✅ [WORKFLOW COMPLETE] ${workflowRunId}:`, finalResult);
	return finalResult;
});
