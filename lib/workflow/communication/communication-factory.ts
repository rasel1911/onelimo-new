import { updateWorkflowQuotesLink } from "@/db/queries/workflow/workflowRun.queries";
import { shortenUrl } from "@/lib/utils/url-shortener";

import {
	sendCustomerQuoteNotificationEmail,
	sendEmailNotificationToProvider,
	sendCustomerConfirmationEmail,
	sendProviderConfirmationEmail,
} from "./email/email-service";
import {
	sendSMSNotificationToProvider,
	sendCustomerQuoteNotificationSMS,
	sendProviderConfirmationSMS,
	sendCustomerConfirmationSMS,
} from "./sms/sms-service";
import { generateProviderLink, generateQuoteLink } from "../algorithms/linkGenerator";
import { buildProviderMapping, createProviderLinkForWorkflow } from "../steps/notificationStep";
import {
	ProviderNotificationBatchResult,
	ProviderNotificationData,
	NotificationService,
	ProviderLinkData,
	CustomerNotificationData,
	NotificationResult,
	ProviderNotificationBatch,
	ProviderNotificationResult,
	CustomerLinkData,
} from "../types/communication";
import {
	ProviderConfirmationData,
	CustomerConfirmationData,
	ConfirmationNotificationResult,
} from "../types/confirmation";

class WorkflowNotificationService implements NotificationService {
	/**
	 * Send notifications to service providers
	 * @param batch - The batch of providers to send notifications to
	 * @param workflowRunId - The ID of the workflow run
	 * @returns The result of the notification batch
	 */
	async sendProviderNotifications(
		batch: ProviderNotificationBatch,
		workflowRunId: string,
	): Promise<ProviderNotificationBatchResult> {
		const { providers, bookingRequest, analysis, workflowProviders } = batch;

		console.log(`📧 Sending notifications to ${providers.length} service providers`);

		const results: ProviderNotificationResult[] = [];
		const errors: string[] = [];
		const providerMap = buildProviderMapping(providers, workflowProviders);

		for (const provider of providers) {
			try {
				const workflowProviderId = providerMap.get(provider.id);

				if (!workflowProviderId) {
					throw new Error(`Workflow provider ID not found for provider ${provider.id}`);
				}

				const { urls, linkData } = await this.generateProviderUrls(
					bookingRequest.id,
					provider.id,
					workflowProviderId,
				);

				console.log("================================================");
				console.log("Booking Request URLs", urls);
				console.log("================================================");

				await createProviderLinkForWorkflow({
					providerId: provider.id,
					linkData,
					workflowRunId,
				});

				const notificationData: ProviderNotificationData = {
					bookingRequest,
					provider,
					analysis,
					urls,
				};

				const [smsResult, emailResult] = await Promise.allSettled([
					sendSMSNotificationToProvider({
						...notificationData,
						maxLength: 300,
					}),
					sendEmailNotificationToProvider({
						...notificationData,
						companyName: "Onelimo",
						supportEmail: process.env.SUPPORT_EMAIL,
					}),
				]);

				if (smsResult.status === "fulfilled") {
					results.push(smsResult.value);
				} else {
					console.error(`SMS failed for provider ${provider.name}:`, smsResult.reason);
					errors.push(`SMS to ${provider.name}: ${smsResult.reason?.message || "Unknown error"}`);
				}

				if (emailResult.status === "fulfilled") {
					results.push(emailResult.value);
				} else {
					console.error(`Email failed for provider ${provider.name}:`, emailResult.reason);
					errors.push(
						`Email to ${provider.name}: ${emailResult.reason?.message || "Unknown error"}`,
					);
				}

				console.log(`✅ Notifications sent to provider ${provider.name}`);
			} catch (error) {
				console.error(`❌ Failed to send notifications to provider ${provider.name}:`, error);
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				errors.push(`Provider ${provider.name}: ${errorMessage}`);
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.filter((r) => !r.success).length;

		console.log(`📊 Successfully sent ${successCount} notifications, ${failureCount} failed`);

		return {
			success: successCount > 0,
			results: results as ProviderNotificationResult[],
			successCount,
			failureCount,
			errors,
		};
	}

	/**
	 * Send notifications to customer
	 * @param data - The customer notification data
	 * @param workflowRunId - The ID of the workflow run
	 * @param customerEmail - The email address of the customer
	 * @param customerPhone - The phone number of the customer
	 * @returns The result of the notification batch
	 */
	async sendCustomerQuoteNotification(
		data: CustomerNotificationData,
		workflowRunId: string,
		customerEmail?: string,
		customerPhone?: string,
	): Promise<{ success: boolean; results: NotificationResult[]; errors: string[] }> {
		const { bookingRequest, selectedQuotes } = data;

		console.log(`📧 Sending quote notifications to customer ${bookingRequest.customerName}`);

		const results: NotificationResult[] = [];
		const errors: string[] = [];

		try {
			const selectedQuoteIds = selectedQuotes.map((quote) => quote.id);
			const { urls, linkData } = await this.generateCustomerUrls(
				bookingRequest.id,
				workflowRunId,
				selectedQuoteIds,
			);
			console.log("================================================");
			console.log("Quotes URLs", urls);
			console.log("================================================");

			await updateWorkflowQuotesLink(
				workflowRunId,
				linkData.hash,
				linkData.encryptedData,
				linkData.expiresAt,
			);

			const notificationData: CustomerNotificationData = {
				...data,
				quotesUrl: urls.quotesUrl,
				shortUrl: urls.shortUrl,
			};

			const promises = [];

			if (customerEmail) {
				promises.push(
					sendCustomerQuoteNotificationEmail({
						...notificationData,
						companyName: "Onelimo",
						supportEmail: process.env.SUPPORT_EMAIL,
						customerEmail,
					}),
				);
			}

			if (customerPhone) {
				promises.push(
					sendCustomerQuoteNotificationSMS({
						...notificationData,
						maxLength: 300,
						customerPhone,
					}),
				);
			}

			if (promises.length === 0) {
				errors.push("No customer contact information available");
			} else {
				const settledResults = await Promise.allSettled(promises);

				settledResults.forEach((result, index) => {
					if (result.status === "fulfilled") {
						results.push(result.value);
					} else {
						console.error(`Customer notification failed:`, result.reason);
						const notificationType = index === 0 ? "Email" : "SMS";
						errors.push(`${notificationType}: ${result.reason?.message || "Unknown error"}`);
					}
				});
			}

			// FIXME: NAME IS NOT FOUND
			console.log(`✅ Quote notifications sent to customer ${bookingRequest.customerName}`);
		} catch (error) {
			console.error(`❌ Failed to send quote notifications to customer:`, error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			errors.push(`Customer notification: ${errorMessage}`);
		}

		const successCount = results.filter((r) => r.success).length;

		return {
			success: successCount > 0,
			results,
			errors,
		};
	}

	/**
	 * Generate provider-specific URLs
	 */
	private async generateProviderUrls(
		bookingRequestId: string,
		providerId: string,
		workflowProviderId: string,
	): Promise<{
		urls: ProviderNotificationData["urls"];
		linkData: ProviderLinkData;
	}> {
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

		const { hash, url, encryptedData, expiresAt } = await generateProviderLink({
			bookingRequestId,
			providerId,
			workflowProviderId,
		});

		const dashboardUrl = `${baseUrl}${url}`;

		const { shortURL } = await shortenUrl({
			originalURL: dashboardUrl,
			allowDuplicates: false,
		});

		return {
			urls: {
				accept: `${dashboardUrl}?action=accept`,
				decline: `${dashboardUrl}?action=decline`,
				viewDetails: `${dashboardUrl}`,
				shortLink: shortURL,
			},
			linkData: {
				hash,
				encryptedData,
				expiresAt,
			},
		};
	}

	private async generateCustomerUrls(
		bookingRequestId: string,
		workflowRunId: string,
		selectedQuoteIds: string[],
	): Promise<{
		urls: Pick<CustomerNotificationData, "quotesUrl" | "shortUrl">;
		linkData: CustomerLinkData;
	}> {
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

		const { hash, url, encryptedData, expiresAt } = await generateQuoteLink({
			bookingRequestId,
			workflowRunId,
			selectedQuoteIds,
		});

		const quotesUrl = `${baseUrl}${url}`;

		const { shortURL } = await shortenUrl({
			originalURL: quotesUrl,
			allowDuplicates: false,
		});

		return {
			urls: {
				quotesUrl,
				shortUrl: shortURL,
			},
			linkData: {
				hash,
				encryptedData,
				expiresAt,
			},
		};
	}

	/**
	 * Send confirmation notifications to provider
	 * @param data - The provider confirmation data
	 * @returns The result of the notification batch
	 */
	async sendProviderConfirmation(
		data: ProviderConfirmationData,
	): Promise<ConfirmationNotificationResult> {
		console.log(`📧 Sending confirmation notifications to provider ${data.providerName}`);

		const results: NotificationResult[] = [];
		const errors: string[] = [];

		const promises = [];

		promises.push(sendProviderConfirmationEmail(data));

		if (data.providerPhone) {
			const smsData = {
				customerName: data.customerName,
				providerName: data.providerName,
				bookingDate: data.bookingDate,
				bookingTime: data.bookingTime,
				pickupAddress: data.pickupAddress,
				dropoffAddress: data.dropoffAddress,
				vehicleType: data.vehicleType,
				confirmedAmount: data.confirmedAmount,
				bookingId: data.bookingId,
				providerId: data.providerId,
				providerPhone: data.providerPhone,
				urgent: data.urgent,
			};
			promises.push(sendProviderConfirmationSMS(smsData));
		} else {
			console.warn(`⚠️ No phone number available for provider ${data.providerName}`);
		}

		if (promises.length === 0) {
			errors.push("No provider contact information available");
		} else {
			const settledResults = await Promise.allSettled(promises);

			settledResults.forEach((result, index) => {
				if (result.status === "fulfilled") {
					results.push(result.value);
				} else {
					console.error(`Provider confirmation failed:`, result.reason);
					const notificationType = index === 0 ? "Email" : "SMS";
					errors.push(`${notificationType}: ${result.reason?.message || "Unknown error"}`);
				}
			});
		}

		const successCount = results.filter((r) => r.success).length;

		return {
			success: successCount > 0,
			results,
			errors,
		};
	}

	/**
	 * Send confirmation notifications to customer
	 * @param data - The customer confirmation data
	 * @returns The result of the notification batch
	 */
	async sendCustomerConfirmation(
		data: CustomerConfirmationData,
	): Promise<ConfirmationNotificationResult> {
		console.log(`📧 Sending confirmation notifications to customer ${data.customerName}`);

		const results: NotificationResult[] = [];
		const errors: string[] = [];

		const promises = [];

		promises.push(sendCustomerConfirmationEmail(data));

		if (data.customerPhone) {
			const smsData = {
				customerName: data.customerName,
				providerName: data.providerName,
				bookingDate: data.bookingDate,
				bookingTime: data.bookingTime,
				pickupAddress: data.pickupAddress,
				dropoffAddress: data.dropoffAddress,
				vehicleType: data.vehicleType,
				confirmedAmount: data.confirmedAmount,
				bookingId: data.bookingId,
				providerId: data.customerId,
				customerPhone: data.customerPhone,
				urgent: data.urgent,
			};
			promises.push(sendCustomerConfirmationSMS(smsData));
		} else {
			console.warn(`⚠️ No phone number available for customer ${data.customerName}`);
		}

		if (promises.length === 0) {
			errors.push("No customer contact information available");
		} else {
			const settledResults = await Promise.allSettled(promises);

			settledResults.forEach((result, index) => {
				if (result.status === "fulfilled") {
					results.push(result.value);
				} else {
					console.error(`Customer confirmation failed:`, result.reason);
					const notificationType = index === 0 ? "Email" : "SMS";
					errors.push(`${notificationType}: ${result.reason?.message || "Unknown error"}`);
				}
			});
		}

		const successCount = results.filter((r) => r.success).length;

		return {
			success: successCount > 0,
			results,
			errors,
		};
	}
}

export const notificationService = new WorkflowNotificationService();
