import { BookingRequest } from "@/db/schema/bookingRequest.schema";

import { createWorkflowGoogleAI } from "../workflowAI";

export interface ResponseAnalyzerInput {
	workflowRunId: string;
	quotes: RawResponseData[];
	bookingRequest: BookingRequest;
}

export interface RawResponseData {
	id: string;
	workflowProviderId: string;
	providerId: string;
	providerName: string;
	providerRating: number;
	providerReliability?: number;

	quoteAmount: number;
	responseNote: string;
	responseTime: Date;

	status: "accepted" | "declined" | "pending";
	reason?: string;
}

export interface ResponseAnalysisResult {
	id: string;
	providerId: string;
	bookingRequestId: string;
	workflowProviderId: string;
	providerName: string;

	overallScore: number;
	viabilityScore: number;
	seriousnessScore: number;
	professionalismScore: number;

	strengths: string[];
	concerns: string[];
	keyPoints: string[];
	analysisNotes: string;

	isRecommended: boolean;
	recommendationReason: string;

	quoteAmount: number;
	responseNote: string;
	analyzedAt: Date;
	reason?: string;
}

export interface ResponseRecommendationResult {
	selectedQuotes: ResponseAnalysisResult[];
	rejectedQuotes: ResponseAnalysisResult[];

	totalAnalyzed: number;
	recommendedCount: number;
	averageScore: number;

	marketInsights: string[];
	selectionStrategy: string;
	confidenceLevel: number;
	overallQuality: string;
	recommendationStrength: string;
}

export interface ResponseComparisonAnalysis {
	totalQuotes: number;
	acceptedQuotes: number;
	declinedQuotes: number;

	quoteAnalyses: ResponseAnalysisResult[];
	recommendations: ResponseRecommendationResult;

	averageViability: number;
	averageSeriousness: number;
	averageProfessionalism: number;

	marketOverview: {
		competitionLevel: "low" | "moderate" | "high";
		responseQuality: "poor" | "fair" | "good" | "excellent";
		priceRange: { min: number; max: number; average: number };
	};
	status?: "no-quotes" | "quotes-accepted" | "quotes-declined";
	error?: string;
}

export type GoogleAI = ReturnType<typeof createWorkflowGoogleAI>;
