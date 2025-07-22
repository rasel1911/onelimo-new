"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { fetchLocations } from "@/app/(dashboard)/admin/locations/actions";

export interface Location {
	id: string;
	city: string;
	zipcodes?: string[];
}

interface LocationsState {
	locations: Location[];
	isLoading: boolean;
	error: string | null;
	lastFetched: number;
}

let locationsCache: {
	data: Location[];
	timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Custom hook for fetching and managing locations with caching and optimized performance
 */
export const useLocations = (options?: {
	enableCache?: boolean;
	autoRefresh?: boolean;
	showToast?: boolean;
}) => {
	const { enableCache = true, autoRefresh = false, showToast = false } = options || {};

	const [state, setState] = useState<LocationsState>({
		locations: locationsCache?.data || [],
		isLoading: !locationsCache?.data,
		error: null,
		lastFetched: locationsCache?.timestamp || 0,
	});

	const isCacheValid = useCallback(() => {
		if (!enableCache || !locationsCache) return false;
		return Date.now() - locationsCache.timestamp < CACHE_TTL;
	}, [enableCache]);

	const fetchLocationsData = useCallback(
		async (forceRefresh = false) => {
			if (!forceRefresh && enableCache && isCacheValid()) {
				setState((prev) => ({
					...prev,
					locations: locationsCache!.data,
					isLoading: false,
					lastFetched: locationsCache!.timestamp,
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			try {
				const result = await fetchLocations();

				if (result.success && result.locations) {
					const locations = result.locations;

					if (enableCache) {
						locationsCache = {
							data: locations,
							timestamp: Date.now(),
						};
					}

					setState({
						locations,
						isLoading: false,
						error: null,
						lastFetched: Date.now(),
					});

					if (showToast && forceRefresh) {
						toast.success("Locations updated successfully");
					}
				} else {
					throw new Error("Failed to fetch locations");
				}
			} catch (error) {
				console.error("Error fetching locations:", error);
				const errorMessage = "Failed to load locations";

				setState((prev) => ({
					...prev,
					isLoading: false,
					error: errorMessage,
				}));

				if (showToast) {
					toast.error(errorMessage);
				}
			}
		},
		[enableCache, isCacheValid, showToast],
	);

	useEffect(() => {
		fetchLocationsData();
	}, [fetchLocationsData]);

	useEffect(() => {
		if (!autoRefresh) return;

		const interval = setInterval(() => {
			if (!isCacheValid()) {
				fetchLocationsData();
			}
		}, CACHE_TTL);

		return () => clearInterval(interval);
	}, [autoRefresh, fetchLocationsData, isCacheValid]);

	const cityNames = useMemo(
		() => state.locations.map((location) => location.city).sort(),
		[state.locations],
	);

	const locationMap = useMemo(
		() => new Map(state.locations.map((location) => [location.id, location])),
		[state.locations],
	);

	const refresh = useCallback(() => fetchLocationsData(true), [fetchLocationsData]);

	const getLocationById = useCallback((id: string) => locationMap.get(id), [locationMap]);

	const getLocationsByIds = useCallback(
		(ids: string[]) => ids.map((id) => locationMap.get(id)).filter(Boolean) as Location[],
		[locationMap],
	);

	const searchLocations = useCallback(
		(query: string) => {
			if (!query.trim()) return state.locations;

			const normalizedQuery = query.toLowerCase();
			return state.locations.filter((location) =>
				location.city.toLowerCase().includes(normalizedQuery),
			);
		},
		[state.locations],
	);

	return {
		locations: state.locations,
		isLoading: state.isLoading,
		error: state.error,
		lastFetched: state.lastFetched,
		cityNames,
		locationMap,
		refresh,
		getLocationById,
		getLocationsByIds,
		searchLocations,
		isCacheValid: isCacheValid(),
	};
};

/**
 * Clear the locations cache manually
 */
export const clearLocationsCache = () => {
	locationsCache = null;
};
