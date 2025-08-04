import { getAllServiceProviders } from "@/db/queries/serviceProvider.queries";
import { BookingRequest, LocationType } from "@/db/schema/bookingRequest.schema";
import { ServiceProvider } from "@/db/schema/serviceProvider.schema";

import { ServiceProviderMatch } from "../types";

const MIN_MATCH_SCORE = 40;

/**
 * Find service providers that match the booking request criteria
 * @param bookingRequest - The booking request to match providers for
 * @param maxProviders - Maximum number of providers to return (default: 5)
 * @returns Promise<ServiceProviderMatch[]> - Array of matched providers with scores
 */
export const findMatchingServiceProviders = async (
	bookingRequest: BookingRequest,
	maxProviders: number = 5,
): Promise<ServiceProviderMatch[]> => {
	try {
		console.log(`🔍 Finding service providers for booking ${bookingRequest.id}`);

		const allProviders = await getAllServiceProviders();

		const activeProviders = allProviders.filter(
			(provider) => provider.status === "active" && provider.isBlocked !== "true",
		);

		const matches: ServiceProviderMatch[] = [];

		for (const provider of activeProviders) {
			const matchScore = calculateMatchScore(bookingRequest, provider);

			if (matchScore >= MIN_MATCH_SCORE) {
				matches.push({
					serviceProvider: provider,
					matchScore,
					availability: true,
				});
			}
		}

		const sortedMatches = matches
			.sort((a, b) => b.matchScore - a.matchScore)
			.slice(0, maxProviders);

		console.log(`✅ Found ${sortedMatches.length} matching service providers`);

		return sortedMatches;
	} catch (error) {
		console.error("❌ Error finding matching service providers:", error);
		throw error;
	}
};

/**
 * Calculate comprehensive match score between booking request and service provider
 * @param bookingRequest - The booking request
 * @param provider - The service provider
 * @returns The total match score
 */
const calculateMatchScore = (bookingRequest: BookingRequest, provider: ServiceProvider): number => {
	let score = 0;

	const locationScore = calculateLocationScore(bookingRequest, provider);
	score += locationScore;

	const serviceTypeScore = calculateServiceTypeScore(bookingRequest, provider);
	score += serviceTypeScore;

	const qualityScore = calculateQualityScore(provider);
	score += qualityScore;

	console.log(
		`Provider ${provider.name}: Location(${locationScore}) + Service(${serviceTypeScore}) + Quality(${qualityScore}) = ${score}`,
	);

	return Math.round(score);
};

/**
 * Calculate location-based score (50 points total)
 * - Pickup city match (provider.serviceLocations) = 25 points
 * - Pickup postcode match (provider.areaCovered) = 10 points
 * - Dropoff city match (provider.serviceLocations) = 10 points
 * - Dropoff postcode match (provider.areaCovered) = 5 points
 */
const calculateLocationScore = (
	bookingRequest: BookingRequest,
	provider: ServiceProvider,
): number => {
	const pickupLocation = bookingRequest.pickupLocation as LocationType;
	const dropoffLocation = bookingRequest.dropoffLocation as LocationType;

	let locationScore = 0;

	const providerServiceLocations = provider.serviceLocations || [];
	const providerAreasCovered = provider.areaCovered || [];

	// Check pickup location matching
	const pickupCityMatch = checkCityMatch(pickupLocation.city, providerServiceLocations);
	if (pickupCityMatch) {
		locationScore += 25;
	}
	if (checkPostcodeMatch(pickupLocation.postcode, providerAreasCovered)) {
		locationScore += 10;
	}

	// Check dropoff location matching
	const dropoffCityMatch = checkCityMatch(dropoffLocation.city, providerServiceLocations);
	if (dropoffCityMatch) {
		locationScore += 10;
	}
	if (checkPostcodeMatch(dropoffLocation.postcode, providerAreasCovered)) {
		locationScore += 5;
	}

	return locationScore;
};

/**
 * Check if a city matches any of the provider's service locations
 */
const checkCityMatch = (requestedCity: string, providerServiceLocations: string[]): boolean => {
	return providerServiceLocations.some(
		(serviceLocation) => serviceLocation.toLowerCase() === requestedCity.toLowerCase(),
	);
};

/**
 * Check if postcode matches any area covered by provider
 */
const checkPostcodeMatch = (postcode: string, areaCovered: string[]): boolean => {
	return areaCovered.some((area) => {
		if (area.toLowerCase() === "all") return true;

		return (
			area.toLowerCase().includes(postcode.toLowerCase()) ||
			postcode.toLowerCase().includes(area.toLowerCase())
		);
	});
};

/**
 * Calculate service type matching score (20 points)
 * - Exact vehicle type match = 20 points
 * - Compatible vehicle type match = 10 points
 */
const calculateServiceTypeScore = (
	bookingRequest: BookingRequest,
	provider: ServiceProvider,
): number => {
	if (!provider.serviceType || !Array.isArray(provider.serviceType)) {
		return 0;
	}

	const requestedVehicleType = bookingRequest.vehicleType.toLowerCase();

	const serviceTypeMatch = provider.serviceType.some((serviceType) => {
		const serviceTypeLower = serviceType.toLowerCase();
		const requestedVehicleTypeLower = requestedVehicleType.toLowerCase();
		return (
			serviceTypeLower.includes(requestedVehicleTypeLower) ||
			requestedVehicleTypeLower.includes(serviceTypeLower)
		);
	});

	if (serviceTypeMatch) {
		return 20;
	}

	const compatibleTypes: Record<string, string[]> = {
		sedan: ["suv", "other"],
		suv: ["sedan", "hummer", "other"],
		stretch_limousine: ["other"],
		party_bus: ["other"],
		hummer: ["suv", "other"],
		other: ["sedan", "suv", "stretch_limousine", "party_bus", "hummer"],
	};

	const compatible = compatibleTypes[requestedVehicleType] || [];
	const hasCompatible = provider.serviceType.some((serviceType) =>
		compatible.includes(serviceType.toLowerCase()),
	);

	if (hasCompatible) {
		return 10;
	}

	return 5;
};

/**
 * Calculate provider quality score (30 points total)
 * - Response time: 15 points max (lower response time = higher score)
 * - Reputation: 15 points max
 */
const calculateQualityScore = (provider: ServiceProvider): number => {
	let qualityScore = 0;

	if (provider.responseTime !== null && provider.responseTime !== undefined) {
		const responseTimeMinutes = provider.responseTime;
		if (responseTimeMinutes <= 30) {
			qualityScore += 15;
		} else if (responseTimeMinutes <= 45) {
			qualityScore += 14;
		} else if (responseTimeMinutes <= 60) {
			qualityScore += 13;
		} else if (responseTimeMinutes <= 90) {
			qualityScore += 12;
		} else if (responseTimeMinutes <= 120) {
			qualityScore += 11;
		} else if (responseTimeMinutes <= 180) {
			qualityScore += 10;
		} else if (responseTimeMinutes <= 240) {
			qualityScore += 9;
		} else {
			qualityScore += 8;
		}
	}

	if (provider.reputation !== null && provider.reputation !== undefined) {
		const normalizedReputation = Math.min(Math.max(provider.reputation / 10, 0), 15);
		qualityScore += Math.round(normalizedReputation);
	}

	return qualityScore;
};

/**
 * Get provider contact information for notifications
 * @param provider - The service provider
 * @returns Object with contact information
 */
export const getProviderContactInfo = (provider: ServiceProvider) => {
	return {
		id: provider.id,
		name: provider.name,
		email: provider.email,
		phone: provider.phone,
	};
};
