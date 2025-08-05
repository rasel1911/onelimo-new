const COUNTRY_CODE = "gb";
const LANGUAGE = "en";
const FORMAT = "json";
const DEFAULT_LIMIT = 8;
const BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

export interface LocationSuggestion {
	formatted: string;
	address_line1?: string;
	address_line2?: string;
	lat: number;
	lon: number;
	city: string;
	county?: string;
	postcode?: string;
	street?: string;
	result_type?: string;
}

interface GeoapifyResponse {
	results: LocationSuggestion[];
}

export interface LocationSearchOptions {
	limit?: number;
	type?: "city";
}

/**
 * Search for places using the Geoapify API.
 * @param query - The search query.
 * @param options - The search options.
 * @returns The search results.
 */
export async function searchPlaces(
	query: string,
	options: LocationSearchOptions = {},
): Promise<LocationSuggestion[]> {
	const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

	if (!apiKey || !query.trim()) {
		return [];
	}

	const { limit = DEFAULT_LIMIT, type } = options;

	try {
		const params = new URLSearchParams({
			text: query.trim(),
			lang: LANGUAGE,
			limit: (type === "city" ? DEFAULT_LIMIT * 2 : limit).toString(),
			filter: `countrycode:${COUNTRY_CODE}`,
			format: FORMAT,
			apiKey: apiKey,
		});

		if (type) {
			params.append("type", type);
		}

		const response = await fetch(`${BASE_URL}?${params}`);

		if (!response.ok) {
			throw new Error(`Geoapify API error: ${response.status}`);
		}

		const data: GeoapifyResponse = await response.json();
		let results = data.results;

		if (type === "city") {
			results = results.filter((result) => ["city", "postcode"].includes(result.result_type || ""));

			const uniqueCities = new Map<string, LocationSuggestion>();
			results.forEach((result) => {
				const key = `${result.city}-${result.county}`;
				if (!uniqueCities.has(key)) {
					uniqueCities.set(key, result);
				}
			});
			results = Array.from(uniqueCities.values());
		}

		return results;
	} catch (error) {
		console.error("Error fetching location suggestions:", error);
		return [];
	}
}
