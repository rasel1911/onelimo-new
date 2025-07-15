import { render } from "@react-email/render";

import { sendEmail } from "@/lib/utils/email-utils";
import { formatStatusText } from "@/lib/utils/formatting";
import {
	EmailService,
	NotificationResult,
	CustomerEmailTemplateContext,
	ProviderNotificationData,
	ProviderNotificationResult,
	CustomerNotificationResult,
	ProviderEmailTemplateContext,
} from "@/lib/workflow/types/communication";
import {
	CustomerConfirmationData,
	ProviderConfirmationData,
} from "@/lib/workflow/types/confirmation";

import CustomerConfirmationEmailTemplate from "./templates/booking-confirmation-customer";
import ProviderConfirmationEmailTemplate from "./templates/booking-confirmation-provider";
import BookingRequestEmailTemplate from "./templates/booking-request-email-template";
import QuoteSummaryEmailTemplate from "./templates/quote-summary";

export class WorkflowEmailService implements EmailService {
	/**
	 * Generate email content using React Email template with analysis data
	 * @param subject - The subject of the email
	 * @param emailTemplate - The React Email template to render
	 * @returns The email content with subject, HTML, and text versions
	 */
	private async generateEmailContent(
		subject: string,
		emailTemplate: React.ReactNode,
	): Promise<{
		subject: string;
		htmlContent: string;
		textContent: string;
	}> {
		const htmlContent = await render(emailTemplate);
		const textContent = await render(emailTemplate, { plainText: true });

		return {
			subject,
			htmlContent,
			textContent,
		};
	}

	/**
	 * Send email notification to a specific email address
	 * @param toEmail - The email address to send the notification to
	 * @param subject - The subject of the email
	 * @param htmlContent - The HTML content of the email
	 * @param textContent - The text content of the email
	 * @returns The result of the email notification
	 */
	async sendEmailNotification(data: {
		toEmail: string;
		subject: string;
		template: React.ReactNode;
	}): Promise<NotificationResult> {
		const { subject, htmlContent, textContent } = await this.generateEmailContent(
			data.subject,
			data.template,
		);

		if (!data.toEmail) {
			return {
				success: false,
				error: "No email address found",
				timestamp: new Date(),
			};
		}

		const result = await sendEmail({
			to: data.toEmail,
			template: {
				subject,
				html: htmlContent,
				text: textContent,
			},
		});

		return {
			success: result.success,
			errorCode: result.success ? undefined : "EMAIL_SEND_FAILED",
			error: result.error ? (result.error as string) : undefined,
			timestamp: new Date(),
		};
	}
}

export const emailService = new WorkflowEmailService();

// ================================================ //
// EMAIL UTILITY FUNCTIONS
// ================================================ //
/**
 * Generate email subject for provider notification
 * @param data - The provider notification data
 * @returns The email subject
 */
const generateServiceProviderEmailSubject = async (
	data: ProviderNotificationData,
): Promise<string> => {
	const { bookingRequest, analysis } = data;
	const pickupTime = new Date(bookingRequest.pickupTime);
	const vehicleType = formatStatusText(bookingRequest.vehicleType);

	const pickupDate = pickupTime.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const urgencyPrefix =
		analysis.urgency === "high" ? "[URGENT] " : analysis.urgency === "medium" ? "[PRIORITY] " : "";

	const subject = `${urgencyPrefix}New booking request from ${bookingRequest.customerName} - ${vehicleType} service on ${pickupDate}`;

	return subject;
};

// ================================================ //
// EMAIL USER & PROVIDER NOTIFICATION FUNCTIONS
// ================================================ //
/**
 * Send email notification to a provider
 * @param data - The provider notification data
 * @returns The result of the email notification
 */
export const sendEmailNotificationToProvider = async (
	data: ProviderEmailTemplateContext,
): Promise<ProviderNotificationResult> => {
	const { provider, analysis } = data;
	const subject = await generateServiceProviderEmailSubject(data);

	const result = await emailService.sendEmailNotification({
		toEmail: provider.email,
		subject,
		template: BookingRequestEmailTemplate(data),
	});

	return {
		providerId: provider.id,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		error: result.error,
		timestamp: new Date(),
		channel: {
			type: "email",
			recipient: provider.email,
			priority: analysis.urgency,
			metadata: {
				templateUsed: "booking-request-template",
				analysisScore: analysis.score,
				urgency: analysis.urgency,
				complexity: analysis.complexity,
				keyPointsCount: analysis.keyPoints.length,
				cleanedMessageUsed: Boolean(analysis.cleanedMessage),
			},
		},
	};
};

/**
 * Send email notification to a customer
 * @param data - The customer notification data
 * @returns The result of the email notification
 */
export const sendCustomerQuoteNotificationEmail = async (
	data: CustomerEmailTemplateContext,
): Promise<CustomerNotificationResult> => {
	const { bookingRequest } = data;
	const subject = `${data.totalQuotes} Quote${data.totalQuotes > 1 ? "s" : ""} Available for Your Booking`;

	const result = await emailService.sendEmailNotification({
		toEmail: data.customerEmail,
		subject,
		template: QuoteSummaryEmailTemplate(data),
	});

	return {
		customerName: bookingRequest.customerName,
		bookingId: bookingRequest.id,
		success: result.success,
		errorCode: result.success ? undefined : "EMAIL_SEND_FAILED",
		errorMessage: result.success ? undefined : "Email sending failed",
		timestamp: new Date(),
		channel: {
			type: "email",
			recipient: data.customerEmail,
			metadata: {
				templateUsed: "quote-summary-template",
				quoteCount: data.selectedQuotes.length,
				totalQuotes: data.totalQuotes,
			},
		},
	};
};

/**
 * Send confirmation email notification to a customer
 * @param data - The customer confirmation data
 * @returns The result of the email notification
 */
export const sendCustomerConfirmationEmail = async (
	data: CustomerConfirmationData,
): Promise<CustomerNotificationResult> => {
	const subject = `Booking Confirmed - ${data.bookingDate} at ${data.bookingTime}`;

	const result = await emailService.sendEmailNotification({
		toEmail: data.customerEmail,
		subject,
		template: CustomerConfirmationEmailTemplate(data),
	});

	return {
		customerName: data.customerName,
		bookingId: data.bookingId,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		timestamp: new Date(),
		channel: {
			type: "email",
			recipient: data.customerEmail,
			metadata: {
				templateUsed: "customer-confirmation-template",
				confirmedAmount: data.confirmedAmount,
			},
		},
	};
};

/**
 * Send confirmation email notification to a provider
 * @param data - The provider confirmation data
 * @returns The result of the email notification
 */
export const sendProviderConfirmationEmail = async (
	data: ProviderConfirmationData,
): Promise<ProviderNotificationResult> => {
	const subject = `Booking Confirmed - ${data.customerName} - ${data.bookingDate}`;

	const result = await emailService.sendEmailNotification({
		toEmail: data.providerEmail,
		subject,
		template: ProviderConfirmationEmailTemplate(data),
	});

	return {
		providerId: data.providerId,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		error: result.error,
		timestamp: new Date(),
		channel: {
			type: "email",
			recipient: data.providerEmail,
			metadata: {
				templateUsed: "provider-confirmation-template",
				confirmedAmount: data.confirmedAmount,
			},
		},
	};
};
