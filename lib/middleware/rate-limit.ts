import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

// FIXME:In-memory store - in production, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
	windowMs: number;
	maxRequests: number;
	keyGenerator?: (request: NextRequest) => string;
}

const defaultOptions: RateLimitOptions = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	maxRequests: 250,
};

/**
 * Rate limiting for admin routes
 */
export function createRateLimiter(options: Partial<RateLimitOptions> = {}) {
	const config = { ...defaultOptions, ...options };

	return async function rateLimitMiddleware(request: NextRequest): Promise<{
		isAllowed: boolean;
		response?: NextResponse;
		remaining: number;
		resetTime: number;
	}> {
		const key = config.keyGenerator ? config.keyGenerator(request) : getDefaultKey(request);
		const now = Date.now();

		// Clean up expired entries
		for (const [entryKey, entry] of rateLimitStore.entries()) {
			if (entry.resetTime < now) {
				rateLimitStore.delete(entryKey);
			}
		}

		let entry = rateLimitStore.get(key);
		if (!entry || entry.resetTime < now) {
			entry = {
				count: 0,
				resetTime: now + config.windowMs,
			};
		}

		entry.count++;
		rateLimitStore.set(key, entry);

		const remaining = Math.max(0, config.maxRequests - entry.count);
		const isAllowed = entry.count <= config.maxRequests;

		if (!isAllowed) {
			const response = NextResponse.json(
				{
					error: "Rate limit exceeded",
					message: `Too many requests. Try again after ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
				},
				{ status: 429 },
			);

			// Add rate limit headers
			response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
			response.headers.set("X-RateLimit-Remaining", "0");
			response.headers.set("X-RateLimit-Reset", entry.resetTime.toString());
			response.headers.set("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());

			return {
				isAllowed: false,
				response,
				remaining: 0,
				resetTime: entry.resetTime,
			};
		}

		return {
			isAllowed: true,
			remaining,
			resetTime: entry.resetTime,
		};
	};
}

/**
 * Generate rate limit key based on IP
 */
function getDefaultKey(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
	return `admin:${ip}`;
}

/**
 * Admin-specific rate limiter with stricter limits
 */
export const adminRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	maxRequests: 100,
	keyGenerator: (request: NextRequest) => {
		const forwarded = request.headers.get("x-forwarded-for");
		const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
		return `admin:${ip}`;
	},
});
