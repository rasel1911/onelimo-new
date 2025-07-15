import { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
		newUser: "/",
	},
	providers: [],
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			let isLoggedIn = !!auth?.user;
			let isOnHome = nextUrl.pathname.startsWith("/");
			let isOnBookingForm = nextUrl.pathname.startsWith("/booking-request-form");
			let isOnRegister = nextUrl.pathname.startsWith("/register");
			let isOnLogin = nextUrl.pathname.startsWith("/login");
			let isOnAdmin = nextUrl.pathname.startsWith("/admin");

			// ------------------------------------------------------------
			// FIXME: Remove this once we have a proper authentication system
			let isOnWorkflow = nextUrl.pathname.startsWith("/api/workflow");

			let isOnDebug =
				nextUrl.pathname.startsWith("/api/debug") ||
				nextUrl.pathname.startsWith("/provider-auth/api/") ||
				nextUrl.pathname.startsWith("/bq/") ||
				nextUrl.pathname.startsWith("/api/bq/quotes/") ||
				nextUrl.pathname.startsWith("/api/bq/");

			// Allow workflow and debug endpoints to be accessed without authentication
			if (isOnWorkflow || isOnDebug) {
				return true;
			}
			// ------------------------------------------------------------

			// Admin route protection
			if (isOnAdmin) {
				if (!isLoggedIn) {
					return Response.redirect(new URL("/login", nextUrl));
				}

				// Check if user has admin role
				const userRole = (auth?.user as any)?.role;
				if (userRole !== "admin") {
					return Response.redirect(new URL("/unauthorized", nextUrl));
				}

				return true;
			}

			if (isLoggedIn && (isOnLogin || isOnRegister)) {
				return Response.redirect(new URL("/", nextUrl));
			}

			if (isOnRegister || isOnLogin) {
				return true;
			}

			if (isOnBookingForm) {
				if (isLoggedIn) return true;
				return false;
			}

			if (isOnHome) {
				return true;
			}

			if (isLoggedIn) {
				return Response.redirect(new URL("/", nextUrl));
			}

			return true;
		},
	},
} satisfies NextAuthConfig;
