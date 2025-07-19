import { NextRequest, NextResponse } from "next/server";

import { validatePersistentLink } from "@/db/queries/persistentRegistrationLink.queries";
import { validateToken } from "@/db/queries/registrationToken.queries";

/**
 * Rate limiting and token security middleware for partner registration
 * This adds additional security measures beyond basic token validation
 */
export const middleware = async (request: NextRequest) => {
	try {
		const searchParams = new URL(request.url).searchParams;
		const token = searchParams.get("token");
		const persistentLinkId = searchParams.get("ref");

		if (!token && !persistentLinkId) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		if (token) {
			const validation = await validateToken(token);

			if (!validation.isValid) {
				console.warn(`Invalid token attempt: ${token}`, {
					ip: request.ip,
					geo: request.geo,
					userAgent: request.headers.get("user-agent"),
					reason: validation.reason,
				});

				return NextResponse.redirect(new URL("/", request.url));
			}
		}

		if (persistentLinkId) {
			const validation = await validatePersistentLink(persistentLinkId);

			if (!validation.isValid) {
				console.warn(`Invalid persistent link attempt: ${persistentLinkId}`, {
					ip: request.ip,
					geo: request.geo,
					userAgent: request.headers.get("user-agent"),
					reason: validation.reason,
				});

				return NextResponse.redirect(new URL("/", request.url));
			}
		}

		return NextResponse.next();
	} catch (error) {
		console.error("Error in partner registration middleware:", error);

		return NextResponse.redirect(new URL("/", request.url));
	}
};

export const config = {
	matcher: "/partner-registration",
};
