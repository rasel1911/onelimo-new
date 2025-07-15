import { createWorkflowGoogleAI } from "../workflowAI";

/**
 * Booking data interface for analysis
 */
export interface BookingData {
	customerName: string;
	pickupLocation: string;
	dropoffLocation: string;
	pickupTime: string;
	estimatedDropoffTime: string;
	estimatedDuration: number;
	passengers: number;
	vehicleType: string;
	specialRequests: string;
	requestCode: string;
}

/**
 * Complete booking analysis result
 */
export interface BookingAnalysis {
	score: number; // 0-100 score
	urgency: "low" | "medium" | "high";
	complexity: "simple" | "moderate" | "complex";
	estimatedValue: number; // In GBP
	refinedMessage: string;
	keyPoints: string[];
	contactDetailsDetected: boolean;
	originalMessage: string;
	cleanedMessage: string;
	feedbackMessage: string;
}

/**
 * Contact analysis result
 */
export interface ContactAnalysisResult {
	hasContactDetails: boolean;
	cleanedMessage: string;
	contactTypes: string[];
	severity: "low" | "medium" | "high";
}

/**
 * Google AI client type
 */
export type GoogleAI = ReturnType<typeof createWorkflowGoogleAI>;
