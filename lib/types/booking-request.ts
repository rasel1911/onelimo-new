import { BookingRequest, LocationType } from "@/db/schema";

export interface BookingRequestResponse {
	id: string;
	createdAt: string;
	requestCode: string;
	customerName: string;
	pickupLocation: LocationType;
	dropoffLocation: LocationType;
	pickupTime: string;
	estimatedDropoffTime: string;
	passengers: number;
	vehicleType: string;
	status: string;
	estimatedDuration: number;
	estimatedDistance: number;
	specialRequests: string | null;
	providerId: string;
	workflowProviderId: string;
	bookingRequestId: string;
	workflowRunId: string | null;
	serviceProviderId: string | null;
	hasResponded: boolean | null;
	responseStatus: string | null;
	responseTime?: string | null;
	hasQuoted?: boolean | null;
	quoteAmount?: number | null;
	quoteTime?: string | null;
	bookingAnalysis?: any;
}

export interface BookingRequestApiSuccessResponse {
	success: true;
	data: BookingRequestResponse;
}

export interface BookingRequestApiErrorResponse {
	success: false;
	error: string;
	expired?: boolean;
	providerId?: string;
}

export type BookingRequestApiResponse =
	| BookingRequestApiSuccessResponse
	| BookingRequestApiErrorResponse;

export interface BookingRequestRespondSuccessResponse {
	success: true;
	message: string;
	data: {
		action: string;
		providerId: string;
		workflowProviderId: string;
	};
}

export interface BookingRequestRespondErrorResponse {
	success: false;
	error: string;
	details?: string;
}

export type BookingRequestRespondApiResponse =
	| BookingRequestRespondSuccessResponse
	| BookingRequestRespondErrorResponse;

export interface BookingWithStatus extends BookingRequest {
	workflowStatus: string | null;
	workflowCurrentStep: string | null;
	workflowCompletedAt: Date | null;
	totalProvidersContacted: number | null;
	totalQuotesReceived: number | null;
}

export interface CreateBookingRequestInput {
	userId: string;
	customerName: string;
	pickupCity: string;
	pickupPostcode: string;
	dropoffCity: string;
	dropoffPostcode: string;
	pickupTime: Date | string;
	estimatedDropoffTime: Date | string;
	estimatedDuration: number;
	passengers: number;
	vehicleType: string;
	specialRequests?: string;
}
