import { NextRequest } from "next/server";
import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";
import { handlePinAuthMiddleware } from "@/lib/middleware/pin-auth";

const nextAuth = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
	const pinAuthResponse = await handlePinAuthMiddleware(request);
	if (pinAuthResponse) {
		return pinAuthResponse;
	}

	return nextAuth(request as any);
}

export const config = {
	matcher: [
		"/",
		"/:id",
		"/api/:path*",
		"/login",
		"/register",
		"/booking-request-form/:path*",
		"/concierge",
	],
};
