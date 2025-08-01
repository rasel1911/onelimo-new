import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

import {
	searchPlaces,
	type LocationSuggestion,
	type LocationSearchOptions,
} from "@/lib/services/geoapify";

export interface UseLocationSearchOptions extends LocationSearchOptions {
	debounceMs?: number;
	minQueryLength?: number;
	enabled?: boolean;
}

export interface UseLocationSearchReturn {
	suggestions: LocationSuggestion[];
	isLoading: boolean;
	error: Error | null;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	debouncedSearch: (query: string) => void;
}

/**
 * Custom hook for location search using react-query
 * @param options - Options for the location search
 * @returns - Object containing the location search results
 */
export const useLocationSearch = (
	options: UseLocationSearchOptions = {},
): UseLocationSearchReturn => {
	const { debounceMs = 300, minQueryLength = 2, enabled = true, ...searchOptions } = options;

	const [searchQuery, setSearchQuery] = useState("");

	const {
		data: suggestions = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["location-search", searchQuery, searchOptions],
		queryFn: () => searchPlaces(searchQuery, searchOptions),
		enabled: enabled && searchQuery.length >= minQueryLength,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const debouncedSearch = useDebouncedCallback((query: string) => {
		setSearchQuery(query);
	}, debounceMs);

	const handleSearchQuery = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	return {
		suggestions,
		isLoading,
		error: error as Error | null,
		searchQuery,
		setSearchQuery: handleSearchQuery,
		debouncedSearch,
	};
};
