import { BookingRequest } from "@/db/schema/bookingRequest.schema";

import {
	ANALYSIS_WEIGHTS,
	RESPONSE_QUALITY_INDICATORS,
	SCORING_THRESHOLDS,
	MARKET_ANALYSIS_THRESHOLDS,
} from "./constants";
import { RawResponseData, ResponseAnalysisResult } from "./types";

/**
 * Calculate viability score based on response content and context
 */
export function calculateViabilityScore(
	response: RawResponseData,
	bookingRequest: BookingRequest,
): number {
	if (response.status === "declined") return 0;
	if (!response.responseNote || response.responseNote.trim().length === 0) return 30;

	const responseText = response.responseNote.toLowerCase();
	let score = 50;

	const responseLength = response.responseNote.length;
	if (responseLength > 100) score += 15;
	else if (responseLength > 50) score += 10;
	else if (responseLength < 20) score -= 15;

	if (bookingRequest.specialRequests) {
		const specialReqs = bookingRequest.specialRequests.toLowerCase();
		const hasAlignment = specialReqs
			.split(" ")
			.some((word) => word.length > 3 && responseText.includes(word));
		if (hasAlignment) score += 12;
		else score -= 8;
	}

	const positiveCount = RESPONSE_QUALITY_INDICATORS.POSITIVE_INDICATORS.filter((keyword) =>
		responseText.includes(keyword),
	).length;
	score += Math.min(20, positiveCount * 4);

	const concernCount = RESPONSE_QUALITY_INDICATORS.CONCERN_KEYWORDS.filter((keyword) =>
		responseText.includes(keyword),
	).length;
	score -= Math.min(15, concernCount * 5);

	if (response.quoteAmount > 0) {
		const pricePerHour = response.quoteAmount / Math.max(60, bookingRequest.estimatedDuration);
		if (pricePerHour < 2000) score += 5;
		if (pricePerHour > 10000) score -= 10;
	}

	return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate seriousness score based on provider commitment and response quality
 */
export function calculateSeriousnessScore(
	response: RawResponseData,
	averageResponseTime?: number,
): number {
	if (response.status === "declined") return 0;
	if (!response.responseNote) return 25;

	const responseText = response.responseNote.toLowerCase();
	let score = 45;

	const professionalCount = RESPONSE_QUALITY_INDICATORS.PROFESSIONAL_KEYWORDS.filter((keyword) =>
		responseText.includes(keyword),
	).length;
	score += Math.min(25, professionalCount * 3);

	if (averageResponseTime && response.responseTime) {
		const responseHours = (response.responseTime.getTime() - Date.now()) / (1000 * 60 * 60);
		if (responseHours < averageResponseTime) score += 8;
		else if (responseHours > averageResponseTime * 2) score -= 12;
	}

	if (response.responseNote.length > 80) score += 10;
	if (response.responseNote.includes("?")) score += 5;
	if (response.responseNote.match(/\d+/)) score += 5;

	if (response.providerRating > 85) score += 8;
	else if (response.providerRating < 60) score -= 8;

	return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate professionalism score based on communication quality
 */
export function calculateProfessionalismScore(response: RawResponseData): number {
	if (response.status === "declined" && !response.reason) return 20;
	if (response.status === "declined" && response.reason) return 60; // Polite decline
	if (!response.responseNote) return 25;

	const responseText = response.responseNote;
	let score = 40;

	const sentences = responseText.split(/[.!?]+/).filter((s) => s.trim().length > 5);
	if (sentences.length > 1) score += 10;
	if (responseText.includes(",")) score += 5;

	const professionalWords = RESPONSE_QUALITY_INDICATORS.PROFESSIONAL_KEYWORDS.filter((keyword) =>
		responseText.toLowerCase().includes(keyword),
	).length;
	score += Math.min(20, professionalWords * 3);

	if (responseText.toLowerCase().includes("thank")) score += 8;
	if (responseText.toLowerCase().includes("please")) score += 6;
	if (responseText.toLowerCase().includes("happy")) score += 5;

	const properCapitalization = /^[A-Z]/.test(responseText) && !/[A-Z]{3,}/.test(responseText); // Not all caps
	if (properCapitalization) score += 8;

	if (responseText.length >= 30 && responseText.length <= 300) score += 10;
	else if (responseText.length > 300) score += 5;
	else if (responseText.length < 15) score -= 15;

	return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate overall weighted score
 */
export function calculateOverallScore(
	viabilityScore: number,
	seriousnessScore: number,
	professionalismScore: number,
): number {
	const weightedScore =
		viabilityScore * ANALYSIS_WEIGHTS.VIABILITY_WEIGHT +
		seriousnessScore * ANALYSIS_WEIGHTS.SERIOUSNESS_WEIGHT +
		professionalismScore * ANALYSIS_WEIGHTS.PROFESSIONALISM_WEIGHT;

	return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Determine if a quote should be recommended based on scores
 */
export function shouldRecommendQuote(
	overallScore: number,
	viabilityScore: number,
	seriousnessScore: number,
	professionalismScore: number,
): boolean {
	return (
		overallScore >= SCORING_THRESHOLDS.MIN_OVERALL_SCORE &&
		viabilityScore >= SCORING_THRESHOLDS.MIN_VIABILITY_SCORE &&
		seriousnessScore >= SCORING_THRESHOLDS.MIN_SERIOUSNESS_SCORE &&
		professionalismScore >= SCORING_THRESHOLDS.MIN_PROFESSIONALISM_SCORE
	);
}

/**
 * Generate strengths based on scores
 */
export function generateStrengths(
	viabilityScore: number,
	seriousnessScore: number,
	professionalismScore: number,
	response: RawResponseData,
): string[] {
	const strengths: string[] = [];

	if (viabilityScore >= SCORING_THRESHOLDS.EXCELLENT_THRESHOLD) {
		strengths.push("Excellent service viability and feasibility");
	} else if (viabilityScore >= SCORING_THRESHOLDS.GOOD_THRESHOLD) {
		strengths.push("Good service capability demonstrated");
	}

	if (seriousnessScore >= SCORING_THRESHOLDS.EXCELLENT_THRESHOLD) {
		strengths.push("High provider commitment and seriousness");
	} else if (seriousnessScore >= SCORING_THRESHOLDS.GOOD_THRESHOLD) {
		strengths.push("Professional commitment to service");
	}

	if (professionalismScore >= SCORING_THRESHOLDS.EXCELLENT_THRESHOLD) {
		strengths.push("Outstanding communication professionalism");
	} else if (professionalismScore >= SCORING_THRESHOLDS.GOOD_THRESHOLD) {
		strengths.push("Professional communication style");
	}

	if (response.quoteAmount > 0) {
		strengths.push(`Competitive pricing at £${(response.quoteAmount / 100).toFixed(2)}`);
	}

	if (response.providerRating >= 85) {
		strengths.push("High customer satisfaction rating");
	}

	return strengths.slice(0, 4);
}

/**
 * Generate concerns based on scores and analysis
 */
export function generateConcerns(
	viabilityScore: number,
	seriousnessScore: number,
	professionalismScore: number,
	response: RawResponseData,
): string[] {
	const concerns: string[] = [];

	if (viabilityScore <= SCORING_THRESHOLDS.POOR_THRESHOLD) {
		concerns.push("Service viability and capability concerns");
	}

	if (seriousnessScore <= SCORING_THRESHOLDS.POOR_THRESHOLD) {
		concerns.push("Limited provider commitment evident");
	}

	if (professionalismScore <= SCORING_THRESHOLDS.POOR_THRESHOLD) {
		concerns.push("Communication professionalism below standards");
	}

	if (response.responseNote && response.responseNote.length < 20) {
		concerns.push("Very brief response may indicate limited engagement");
	}

	if (response.providerRating < 70) {
		concerns.push("Below average provider rating");
	}

	return concerns.slice(0, 3);
}

/**
 * Generate key points for decision making
 */
export function generateKeyPoints(
	response: RawResponseData,
	overallScore: number,
	viabilityScore: number,
): string[] {
	const keyPoints: string[] = [];

	keyPoints.push(`Quote amount: £${(response.quoteAmount / 100).toFixed(2)}`);
	keyPoints.push(`Overall analysis score: ${overallScore}/100`);

	if (viabilityScore >= SCORING_THRESHOLDS.GOOD_THRESHOLD) {
		keyPoints.push(`Strong service viability (${viabilityScore}/100)`);
	} else if (viabilityScore <= SCORING_THRESHOLDS.POOR_THRESHOLD) {
		keyPoints.push(`Service viability concerns (${viabilityScore}/100)`);
	}

	keyPoints.push(`Provider: ${response.providerName}`);

	if (response.providerRating >= 80) {
		keyPoints.push(`High provider rating (${response.providerRating}/100)`);
	}

	return keyPoints.slice(0, 5);
}

/**
 * Calculate market competition level
 */
export function calculateMarketCompetition(totalQuotes: number): "low" | "moderate" | "high" {
	if (totalQuotes >= MARKET_ANALYSIS_THRESHOLDS.HIGH_COMPETITION_THRESHOLD) {
		return "high";
	} else if (totalQuotes >= MARKET_ANALYSIS_THRESHOLDS.MODERATE_COMPETITION_THRESHOLD) {
		return "moderate";
	}
	return "low";
}

/**
 * Determine overall response quality
 */
export function calculateResponseQuality(
	analyses: ResponseAnalysisResult[],
): "poor" | "fair" | "good" | "excellent" {
	if (analyses.length === 0) return "poor";

	const averageProfessionalism =
		analyses.reduce((sum, a) => sum + a.professionalismScore, 0) / analyses.length;

	if (averageProfessionalism >= SCORING_THRESHOLDS.EXCELLENT_THRESHOLD) return "excellent";
	if (averageProfessionalism >= SCORING_THRESHOLDS.GOOD_THRESHOLD) return "good";
	if (averageProfessionalism >= SCORING_THRESHOLDS.FAIR_THRESHOLD) return "fair";
	return "poor";
}

/**
 * Format booking context for prompts
 */
export function formatBookingContext(bookingRequest: BookingRequest): string {
	return `
<bookingRequest id="${bookingRequest.id}">
   <requestCode>${bookingRequest.requestCode}</requestCode>
   <customer>${bookingRequest.customerName}</customer>
   <route>
      <pickup>
         		<city>${bookingRequest.pickupLocation.city}</city>
		<address>${bookingRequest.pickupLocation.address || `${bookingRequest.pickupLocation.city}${bookingRequest.pickupLocation.postcode ? ", " + bookingRequest.pickupLocation.postcode : ""}`}</address>
	</pickup>
	<dropoff>
		<city>${bookingRequest.dropoffLocation.city}</city>
		<address>${bookingRequest.dropoffLocation.address || `${bookingRequest.dropoffLocation.city}${bookingRequest.dropoffLocation.postcode ? ", " + bookingRequest.dropoffLocation.postcode : ""}`}</address>
      </dropoff>
   </route>
   <pickupTime>${bookingRequest.pickupTime.toLocaleString()}</pickupTime>
   <estimatedDuration>${bookingRequest.estimatedDuration} minutes</estimatedDuration>
   <passengers>${bookingRequest.passengers}</passengers>
   <vehicleType>${bookingRequest.vehicleType}</vehicleType>
   <specialRequests>${bookingRequest.specialRequests || "None"}</specialRequests>
   <createdAt>${bookingRequest.createdAt.toLocaleString()}</createdAt>
</bookingRequest>
`.trim();
}

/**
 * Format quote data for prompts
 */
export function formatQuoteForPrompt(quote: RawResponseData, index: number): string {
	return `
<quote id="${quote.id}" index="${index + 1}">
   <provider>${quote.providerName}</provider>
   <providerId>${quote.providerId}</providerId>
   <workflowProviderId>${quote.workflowProviderId}</workflowProviderId>
   <rating>${quote.providerRating}/100</rating>
   <status>${quote.status}</status>
   <amount>£${(quote.quoteAmount / 100).toFixed(2)}</amount>
   <responseTime>${quote.responseTime.toLocaleString()}</responseTime>
   <responseNote>"${quote.responseNote}"</responseNote>
   ${quote.reason ? `<declineReason>${quote.reason}</declineReason>` : ""}
</quote>
`.trim();
}

export function formatAnalysisForPrompt(analysis: ResponseAnalysisResult): string {
	return `
<quote id="${analysis.id}">
   <provider>${analysis.providerName}</provider>
   <providerId>${analysis.providerId}</providerId>
   <workflowProviderId>${analysis.workflowProviderId}</workflowProviderId>
   <scores>
      <overall>${analysis.overallScore}/100</overall>
      <viability>${analysis.viabilityScore}/100</viability>
      <seriousness>${analysis.seriousnessScore}/100</seriousness>
      <professionalism>${analysis.professionalismScore}/100</professionalism>
   </scores>
   <amount>£${(analysis.quoteAmount / 100).toFixed(2)}</amount>
   <recommendation>${analysis.isRecommended ? "YES" : "NO"}</recommendation>
   <strengths>${analysis.strengths.join(", ")}</strengths>
   <concerns>${analysis.concerns.join(", ") || "None"}</concerns>
   <notes>${analysis.analysisNotes}</notes>
</quote>
`.trim();
}
