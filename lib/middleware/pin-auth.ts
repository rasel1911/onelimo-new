import { NextRequest, NextResponse } from "next/server";

import { getWorkflowProviderLinkData } from "@/db/queries/workflow/workflowProvider.queries";
import { decodeProviderLinkFromData } from "@/lib/workflow/algorithms/linkGenerator";

export interface PinAuthSession {
	providerId: string;
	authenticated: boolean;
	expiresAt: number;
}

const PIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export const createPinSession = (providerId: string): PinAuthSession => ({
	providerId,
	authenticated: true,
	expiresAt: Date.now() + PIN_SESSION_DURATION,
});

export const validatePinSession = (session: PinAuthSession | null): boolean => {
	if (!session) return false;
	if (!session.authenticated) return false;
	if (Date.now() > session.expiresAt) return false;
	return true;
};

export const extractProviderIdFromPath = async (pathname: string): Promise<string | null> => {
	const bqMatch = pathname.match(/^\/bq\/([^\/]+)/);
	if (bqMatch) {
		try {
			const bookingReqHash = bqMatch[1];

			const providerData = await getWorkflowProviderLinkData(bookingReqHash);
			if (!providerData || providerData.length === 0) {
				return null;
			}

			const provider = providerData[0];
			if (!provider.linkEncryptedData) {
				return null;
			}

			const decodedLinkData = await decodeProviderLinkFromData(provider.linkEncryptedData);
			return decodedLinkData.providerId;
		} catch (error) {
			console.error("Error extracting provider ID from booking hash:", error);
			return null;
		}
	}

	const providerMatch = pathname.match(/^\/provider-auth\/([^\/]+)/);
	if (providerMatch) {
		return providerMatch[1];
	}

	return null;
};

export const isPinProtectedRoute = (pathname: string): boolean => {
	const protectedPatterns = [
		/^\/bq\/[^\/]+$/, // Booking request pages
		/^\/provider-dashboard/, // Provider dashboard
		/^\/provider-auth\/setup/, // PIN setup (after provider creation)
	];

	return protectedPatterns.some((pattern) => pattern.test(pathname));
};

export const isProviderAuthRoute = (pathname: string): boolean => {
	const authRoutes = [/^\/provider-auth\/reset-pin/, /^\/provider-auth\/api/];

	return authRoutes.some((pattern) => pattern.test(pathname));
};

export const getSessionFromRequest = (request: NextRequest): PinAuthSession | null => {
	try {
		const sessionCookie = request.cookies.get("pin-auth-session");
		if (!sessionCookie) return null;

		const session = JSON.parse(sessionCookie.value) as PinAuthSession;
		return validatePinSession(session) ? session : null;
	} catch {
		return null;
	}
};

export const setSessionInResponse = (
	response: NextResponse,
	session: PinAuthSession | null,
): void => {
	if (session) {
		response.cookies.set("pin-auth-session", JSON.stringify(session), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: PIN_SESSION_DURATION / 1000,
			path: "/",
		});
	} else {
		response.cookies.delete("pin-auth-session");
	}
};

export const handlePinAuthMiddleware = async (
	request: NextRequest,
): Promise<NextResponse | null> => {
	const { pathname } = request.nextUrl;

	// Skip middleware for auth routes
	if (isProviderAuthRoute(pathname)) {
		return null;
	}

	// Only apply to PIN-protected routes
	if (!isPinProtectedRoute(pathname)) {
		return null;
	}

	const session = getSessionFromRequest(request);
	const providerId = await extractProviderIdFromPath(pathname);

	if (!providerId) {
		return null;
	}

	if (session && session.providerId === providerId) {
		return null;
	}

	const redirectUrl = new URL(pathname, request.url);
	redirectUrl.searchParams.set("auth", "required");

	return NextResponse.redirect(redirectUrl);
};
