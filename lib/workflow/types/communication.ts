import { WorkflowProvider } from "@/db/schema";
import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { ServiceProvider } from "@/db/schema/serviceProvider.schema";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { BookingAnalysis } from "@/lib/ai/services/bookingAnalyzer";

// ================================ //
// NOTIFICATION TYPES
// ================================ //
export interface NotificationService {
	sendProviderNotifications(
		batch: ProviderNotificationBatch,
		workflowRunId: string,
	): Promise<ProviderNotificationBatchResult>;

	sendCustomerQuoteNotification(
		data: CustomerNotificationData,
		workflowRunId: string,
		customerEmail?: string,
		customerPhone?: string,
	): Promise<{ success: boolean; results: NotificationResult[]; errors: string[] }>;
}

export interface NotificationChannel {
	type: "email" | "sms";
	recipient: string;
	priority?: "low" | "medium" | "high";
	metadata?: Record<string, string | number | boolean>;
}

export interface NotificationResult {
	errorCode?: string;
	success: boolean;
	error?: string;
	timestamp: Date;
}

// ================================ //
// EMAIL SERVICE TYPES
// ================================ //
export interface EmailService {
	sendEmailNotification(data: {
		toEmail: string;
		subject: string;
		template: React.ReactNode;
	}): Promise<NotificationResult>;
}

// ================================ //
// PROVIDER NOTIFICATION DATA TYPES
// ================================ //
export interface ProviderNotificationData {
	bookingRequest: BookingRequest;
	provider: ServiceProvider;
	analysis: BookingAnalysis;
	urls: {
		accept: string;
		decline: string;
		viewDetails: string;
		shortLink: string;
	};
}

export interface ProviderEmailTemplateContext extends ProviderNotificationData {
	companyName: string;
	supportEmail?: string;
}

export interface ProviderNotificationBatch {
	providers: ServiceProvider[];
	bookingRequest: BookingRequest;
	analysis: BookingAnalysis;
	workflowProviders: WorkflowProvider[];
}

export interface ProviderNotificationResult {
	providerId: string;
	errorCode?: string;
	errorMessage?: string;
	success: boolean;
	error?: string;
	timestamp: Date;
	channel: NotificationChannel;
}

export interface ProviderNotificationBatchResult {
	success: boolean;
	results: ProviderNotificationResult[];
	successCount: number;
	failureCount: number;
	errors: string[];
}

export type ProviderLinkData = {
	hash: string;
	encryptedData: string;
	expiresAt: Date;
};

export type CustomerLinkData = ProviderLinkData;

// ================================ //
// CUSTOMER NOTIFICATION DATA TYPES
// ================================ //
export interface CustomerNotificationData {
	bookingRequest: BookingRequest;
	bookingId: string;
	customerEmail: string;
	customerName: string;
	selectedQuotes: WorkflowQuote[];
	totalQuotes: number;
	quotesUrl?: string;
	shortUrl?: string;
}

export interface CustomerEmailTemplateContext extends CustomerNotificationData {
	companyName: string;
	supportEmail?: string;
}

export interface CustomerNotificationResult {
	customerName: string;
	bookingId: string;
	errorCode?: string;
	errorMessage?: string;
	success: boolean;
	error?: string;
	timestamp: Date;
	channel: NotificationChannel;
}

// ================================ //
// SMS SERVICE TYPES
// ================================ //

export interface SMSTemplateContext extends ProviderNotificationData {
	maxLength: number;
}

export interface CustomerSMSTemplateContext extends CustomerNotificationData {
	maxLength: number;
}

export interface SMSNotificationResult {
	errorCode?: string;
	success: boolean;
	error?: string;
	timestamp: Date;
}

export interface SMSService {
	sendSMSNotification(data: { phone: string; message: string }): Promise<SMSNotificationResult>;
}

// ================================ //
// EMAIL TEMPLATE PROPS TYPES
// ================================ //
export interface BookingRequestEmailProps {
	customerName: string;

	bookingId: string;
	providerName: string;
	serviceType: string;
	bookingDate: string;
	bookingTime: string;
	estimatedDuration: string;

	pickupAddress: string;
	pickupTime: string;
	dropoffAddress: string;
	dropoffTime: string;

	vehicleType: string;
	passengerCount: number;

	specialNotes?: string;

	acceptUrl: string;
	declineUrl: string;
	viewDetailsUrl: string;

	companyName: string;

	urgency: "low" | "medium" | "high";
	cleanedMessage: string;
	keyPoints: string[];
}

export interface QuoteSummaryEmailProps {
	customerName: string;
	bookingId: string;

	serviceType: string;
	bookingDate: string;
	bookingTime: string;

	pickupAddress: string;
	dropoffAddress: string;

	vehicleType: string;
	passengerCount: number;

	quotesAvailable: number;
	totalQuotesReceived: number;
	bestQuoteAmount?: number;
	averageQuoteAmount?: number;
	quotesUrl: string;

	companyName: string;
	supportEmail?: string;
}

export interface CustomerConfirmationEmailProps {
	customerName: string;
	bookingId: string;

	providerName: string;
	providerPhone: string;
	providerEmail: string;
	providerRating?: number;

	serviceType: string;
	bookingDate: string;
	bookingTime: string;
	estimatedDuration: string;

	pickupAddress: string;
	pickupTime: string;
	dropoffAddress: string;
	dropoffTime: string;

	vehicleType: string;
	passengerCount: number;

	confirmedAmount: number;
	specialNotes?: string;

	googleCalendarUrl: string;
	companyName: string;
	supportEmail?: string;
}