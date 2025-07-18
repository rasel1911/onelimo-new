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
			let isOnConcierge = nextUrl.pathname.startsWith("/concierge");
			let isOnHome = nextUrl.pathname === "/";
			let isOnBookingForm = nextUrl.pathname.startsWith("/booking-request-form");
			let isOnRegister = nextUrl.pathname.startsWith("/register");
			let isOnLogin = nextUrl.pathname.startsWith("/login");
			let isOnAdmin = nextUrl.pathname.startsWith("/admin");

			if (isLoggedIn && (isOnLogin || isOnRegister)) {
				return Response.redirect(new URL("/", nextUrl));
			}

			if (isOnAdmin) {
				if (!isLoggedIn) {
					const loginUrl = new URL("/login", nextUrl);
					loginUrl.searchParams.set("callbackUrl", nextUrl.href);
					return Response.redirect(loginUrl);
				}

				return true;
			}

			if (isOnBookingForm) {
				if (isLoggedIn) return true;

				const loginUrl = new URL("/login", nextUrl);
				loginUrl.searchParams.set("callbackUrl", nextUrl.href);
				return Response.redirect(loginUrl);
			}

			if (isOnConcierge) {
				if (isLoggedIn) return true;

				const loginUrl = new URL("/login", nextUrl);
				loginUrl.searchParams.set("callbackUrl", nextUrl.href);
				return Response.redirect(loginUrl);
			}

			if (isOnHome) {
				return true;
			}

			return true;
		},
	},
} satisfies NextAuthConfig;
