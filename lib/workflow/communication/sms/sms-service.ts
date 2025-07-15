import { twilioService } from "@/lib/utils/sms-utils";
import {
	SMSTemplateContext,
	NotificationResult,
	CustomerSMSTemplateContext,
	ProviderNotificationResult,
	CustomerNotificationResult,
	SMSService,
} from "@/lib/workflow/types/communication";
import { ConfirmationSMSData } from "@/lib/workflow/types/confirmation";

import {
	generateProviderConfirmationSMS,
	generateCustomerConfirmationSMS,
	generateUrgentProviderConfirmationSMS,
	generateUrgentCustomerConfirmationSMS,
} from "./templates/booking-confirmation";
import {
	generateBookingRequestSMS,
	generateUrgentBookingRequestSMS,
} from "./templates/booking-request-sms-template";
import {
	generateQuoteAvailableSMS,
	generateUrgentQuoteAvailableSMS,
} from "./templates/quote-available";

export class WorkflowSMSService implements SMSService {
	/**
	 * Send SMS notification to a specific phone number
	 * @param phone - The phone number to send the SMS to
	 * @param message - The SMS message content
	 * @returns The result of the SMS notification
	 */
	async sendSMSNotification(data: { phone: string; message: string }): Promise<NotificationResult> {
		if (!data.phone) {
			return {
				success: false,
				error: "No phone number found",
				timestamp: new Date(),
			};
		}

		const result = await twilioService.sendSMS(data.phone, data.message);

		return {
			success: result.success,
			errorCode: result.success ? undefined : "SMS_SEND_FAILED",
			error: result.error ? (result.error as string) : undefined,
			timestamp: new Date(),
		};
	}
}

export const smsService = new WorkflowSMSService();

// ================================================ //
// SMS PROVIDER NOTIFICATION FUNCTIONS
// ================================================ //
const selectOptimalProviderTemplate = (data: SMSTemplateContext): string => {
	const { analysis, maxLength } = data;

	if (analysis.urgency === "high" || maxLength <= 160) {
		const urgentMessage = generateUrgentBookingRequestSMS(data);
		if (urgentMessage.length <= maxLength) {
			return urgentMessage;
		}
	}

	const standardMessage = generateBookingRequestSMS(data);

	if (standardMessage.length > maxLength) {
		return generateUrgentBookingRequestSMS(data);
	}

	return standardMessage;
};

const getProviderTemplateUsed = (data: SMSTemplateContext): string => {
	const { analysis, maxLength } = data;

	if (analysis.urgency === "high" || maxLength <= 160) {
		return "UrgentBookingRequestSMS";
	}

	return "BookingRequestSMS";
};

/**
 * Send SMS notification to a provider
 * @param data - The provider notification data
 * @returns The result of the SMS notification
 */
export const sendSMSNotificationToProvider = async (
	data: SMSTemplateContext,
): Promise<ProviderNotificationResult> => {
	const { provider, analysis } = data;
	const message = selectOptimalProviderTemplate(data);

	const result = await smsService.sendSMSNotification({
		phone: provider.phone,
		message,
	});

	return {
		providerId: provider.id,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		error: result.error,
		timestamp: new Date(),
		channel: {
			type: "sms",
			recipient: provider.phone || provider.name,
			priority: analysis.urgency,
			metadata: {
				templateUsed: getProviderTemplateUsed(data),
				messageLength: message.length,
				analysisScore: analysis.score,
				urgency: analysis.urgency,
				complexity: analysis.complexity,
				keyPointsCount: analysis.keyPoints.length,
				cleanedMessageUsed: Boolean(analysis.cleanedMessage),
			},
		},
	};
};

// ================================================ //
// SMS CUSTOMER NOTIFICATION FUNCTIONS
// ================================================ //
const selectOptimalCustomerTemplate = (data: CustomerSMSTemplateContext): string => {
	const { maxLength, selectedQuotes } = data;

	if (selectedQuotes.length > 3 || maxLength <= 160) {
		const urgentMessage = generateUrgentQuoteAvailableSMS(data);
		if (urgentMessage.length <= maxLength) {
			return urgentMessage;
		}
	}

	const standardMessage = generateQuoteAvailableSMS(data);

	if (standardMessage.length > maxLength) {
		return generateUrgentQuoteAvailableSMS(data);
	}

	return standardMessage;
};

const getCustomerTemplateUsed = (data: CustomerSMSTemplateContext): string => {
	const { maxLength, selectedQuotes } = data;

	if (selectedQuotes.length > 3 || maxLength <= 160) {
		return "UrgentQuoteAvailableSMS";
	}

	return "QuoteAvailableSMS";
};
/**
 * Send SMS notification to a customer
 * @param data - The customer notification data
 * @returns The result of the SMS notification
 */
export const sendCustomerQuoteNotificationSMS = async (
	data: CustomerSMSTemplateContext & { customerPhone: string },
): Promise<CustomerNotificationResult> => {
	const { bookingRequest, customerPhone } = data;
	const message = selectOptimalCustomerTemplate(data);

	const result = await smsService.sendSMSNotification({
		phone: customerPhone,
		message,
	});

	return {
		customerName: bookingRequest.customerName,
		bookingId: bookingRequest.id,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		timestamp: new Date(),
		channel: {
			type: "sms",
			recipient: customerPhone,
			metadata: {
				templateUsed: getCustomerTemplateUsed(data),
				messageLength: message.length,
				quoteCount: data.selectedQuotes.length,
				totalQuotes: data.totalQuotes,
			},
		},
	};
};

// ================================================ //
// SMS CONFIRMATION FUNCTIONS
// ================================================ //

/**
 * Send confirmation SMS to provider
 * @param data - The provider confirmation data
 * @returns The result of the SMS notification
 */
export const sendProviderConfirmationSMS = async (
	data: ConfirmationSMSData & { providerPhone: string; urgent?: boolean },
): Promise<ProviderNotificationResult> => {
	const { providerPhone, urgent = false } = data;

	const message = urgent
		? generateUrgentProviderConfirmationSMS(data)
		: generateProviderConfirmationSMS(data);

	const result = await smsService.sendSMSNotification({
		phone: providerPhone,
		message,
	});

	return {
		providerId: data.providerId,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		error: result.error,
		timestamp: new Date(),
		channel: {
			type: "sms",
			recipient: providerPhone,
			priority: urgent ? "high" : "medium",
			metadata: {
				templateUsed: urgent ? "UrgentProviderConfirmationSMS" : "ProviderConfirmationSMS",
				messageLength: message.length,
				confirmedAmount: data.confirmedAmount,
			},
		},
	};
};

/**
 * Send confirmation SMS to customer
 * @param data - The customer confirmation data
 * @returns The result of the SMS notification
 */
export const sendCustomerConfirmationSMS = async (
	data: ConfirmationSMSData & { customerPhone: string; urgent?: boolean },
): Promise<CustomerNotificationResult> => {
	const { customerPhone, urgent = false } = data;

	const message = urgent
		? generateUrgentCustomerConfirmationSMS(data)
		: generateCustomerConfirmationSMS(data);

	const result = await smsService.sendSMSNotification({
		phone: customerPhone,
		message,
	});

	return {
		customerName: data.customerName,
		bookingId: data.bookingId,
		success: result.success,
		errorCode: result.errorCode,
		errorMessage: result.error,
		timestamp: new Date(),
		channel: {
			type: "sms",
			recipient: customerPhone,
			priority: urgent ? "high" : "medium",
			metadata: {
				templateUsed: urgent ? "UrgentCustomerConfirmationSMS" : "CustomerConfirmationSMS",
				messageLength: message.length,
				confirmedAmount: data.confirmedAmount,
			},
		},
	};
};
