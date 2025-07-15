import { getAllServiceProviders } from "@/db/queries/serviceProvider.queries";
import { BookingRequest, LocationType } from "@/db/schema/bookingRequest.schema";
import { ServiceProvider } from "@/db/schema/serviceProvider.schema";

import { ServiceProviderMatch } from "../types";

// FIXME: Fix the provider mathcher after workflow completion
/**
 * Find service providers that match the booking request criteria
 */
export async function findMatchingServiceProviders(
	bookingRequest: BookingRequest,
	maxProviders: number = 5,
): Promise<ServiceProviderMatch[]> {
	try {
		console.log(`🔍 Finding service providers for booking ${bookingRequest.id}`);

		// Get all active service providers
		const allProviders = await getAllServiceProviders();
		const activeProviders = allProviders.filter((provider) => provider.status === "active");

		console.log(`📊 Found ${activeProviders.length} active service providers`);

		// Score and filter providers
		const matches: ServiceProviderMatch[] = [];

		for (const provider of activeProviders) {
			const matchScore = calculateMatchScore(bookingRequest, provider);

			if (matchScore > 0) {
				matches.push({
					serviceProvider: provider,
					matchScore,
					availability: true, // TODO: Implement real availability check
				});
			}
		}

		// Sort by match score (highest first) and limit results
		const sortedMatches = matches
			.sort((a, b) => b.matchScore - a.matchScore)
			.slice(0, maxProviders);

		console.log(`✅ Found ${sortedMatches.length} matching service providers`);

		return sortedMatches;
	} catch (error) {
		console.error("❌ Error finding matching service providers:", error);
		throw error;
	}
}

/**
 * Calculate match score between booking request and service provider
 */
function calculateMatchScore(bookingRequest: BookingRequest, provider: ServiceProvider): number {
	let score = 0;

	// Base score for active providers
	if (provider.status === "active") {
		score += 50;
	} else if (provider.status === "pending") {
		score += 25;
	}

	// Location matching
	const locationScore = calculateLocationScore(bookingRequest, provider);
	score += locationScore;

	// Service type matching
	const serviceTypeScore = calculateServiceTypeScore(bookingRequest, provider);
	score += serviceTypeScore;

	// Reputation bonus
	if (provider.reputation && provider.reputation > 0) {
		score += Math.min(provider.reputation / 10, 20); // Max 20 points for reputation
	}

	// Response time bonus (lower is better)
	if (provider.responseTime && provider.responseTime > 0) {
		const responseBonus = Math.max(10 - provider.responseTime / 60, 0); // Max 10 points
		score += responseBonus;
	}

	return Math.round(score);
}

/**
 * Calculate location-based score
 */
function calculateLocationScore(bookingRequest: BookingRequest, provider: ServiceProvider): number {
	const pickupLocation = bookingRequest.pickupLocation as LocationType;
	const dropoffLocation = bookingRequest.dropoffLocation as LocationType;

	let locationScore = 0;

	// Check if provider covers the pickup area
	if (provider.areaCovered && Array.isArray(provider.areaCovered)) {
		const pickupMatch = provider.areaCovered.some(
			(area) =>
				area.toLowerCase().includes(pickupLocation.city.toLowerCase()) ||
				area.toLowerCase().includes(pickupLocation.postcode.toLowerCase()),
		);

		const dropoffMatch = provider.areaCovered.some(
			(area) =>
				area.toLowerCase().includes(dropoffLocation.city.toLowerCase()) ||
				area.toLowerCase().includes(dropoffLocation.postcode.toLowerCase()),
		);

		if (pickupMatch && dropoffMatch) {
			locationScore += 30; // Both locations covered
		} else if (pickupMatch || dropoffMatch) {
			locationScore += 15; // One location covered
		}
	}

	return locationScore;
}

/**
 * Calculate service type matching score
 */
function calculateServiceTypeScore(
	bookingRequest: BookingRequest,
	provider: ServiceProvider,
): number {
	if (!provider.serviceType || !Array.isArray(provider.serviceType)) {
		return 5; // Small score for providers without specified service types
	}

	const requestedVehicleType = bookingRequest.vehicleType.toLowerCase();

	// Check for exact match
	const exactMatch = provider.serviceType.some(
		(serviceType) => serviceType.toLowerCase() === requestedVehicleType,
	);

	if (exactMatch) {
		return 25; // High score for exact match
	}

	// Check for partial matches or compatible types
	const compatibleTypes: Record<string, string[]> = {
		sedan: ["sedan", "suv"],
		suv: ["suv", "sedan"],
		stretch_limousine: ["stretch_limousine", "other"],
		party_bus: ["party_bus", "other"],
		hummer: ["hummer", "suv", "other"],
		other: ["other", "suv", "sedan"],
	};

	const compatible = compatibleTypes[requestedVehicleType] || [];
	const hasCompatible = provider.serviceType.some((serviceType) =>
		compatible.includes(serviceType.toLowerCase()),
	);

	if (hasCompatible) {
		return 10; // Lower score for compatible types
	}

	return 0; // No match
}

/**
 * Get provider contact information for notifications
 */
export function getProviderContactInfo(provider: ServiceProvider) {
	return {
		id: provider.id,
		name: provider.name,
		email: provider.email,
		phone: provider.phone,
	};
}
