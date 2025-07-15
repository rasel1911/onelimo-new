export interface ShortenUrlRequest {
	originalURL: string;
	allowDuplicates?: boolean;
}

export interface ShortenUrlResponse {
	success: boolean;
	shortURL: string;
	originalURL?: string;
	error?: string;
}

/**
 * Shorten a URL using short.io API
 */
export async function shortenUrl({
	originalURL,
	allowDuplicates = false,
}: ShortenUrlRequest): Promise<ShortenUrlResponse> {
	try {
		const apiKey = process.env.SHORT_IO_API_KEY;
		const shortDomain = process.env.SHORT_IO_DOMAIN;

		if (!apiKey) {
			throw new Error("SHORT_IO_API_KEY environment variable is not set");
		}

		if (!originalURL || !isValidUrl(originalURL)) {
			throw new Error("Invalid URL provided");
		}

		const requestBody = {
			allowDuplicates,
			originalURL,
			domain: shortDomain,
		};

		const response = await fetch("https://api.short.io/links", {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				Authorization: apiKey,
			},
			body: JSON.stringify(requestBody),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || `HTTP error! status: ${response.status}`);
		}

		return {
			success: data.success,
			shortURL: data.shortURL,
			originalURL,
		};
	} catch (error) {
		console.error("URL shortening error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
			shortURL: originalURL,
			originalURL,
		};
	}
}

/**
 * Validate URL format
 */
function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}
