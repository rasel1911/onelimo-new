import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { getUserById, isUserAdmin } from "@/db/queries";

/**
 * @description Admin authentication middleware helper
 * Verifies that the user is authenticated and has admin role
 * @param request - The request object
 * @returns An object containing the authorization status, user ID, and response
 */
export const verifyAdminAccess = async (
	request: NextRequest,
): Promise<{
	isAuthorized: boolean;
	userId?: string;
	response?: NextResponse;
}> => {
	try {
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		});

		if (!token || !token.id) {
			return {
				isAuthorized: false,
				response: NextResponse.redirect(new URL("/login", request.url)),
			};
		}

		const isAdmin = await isUserAdmin(token.id as string);

		if (!isAdmin) {
			return {
				isAuthorized: false,
				response: NextResponse.redirect(new URL("/unauthorized", request.url)),
			};
		}

		return {
			isAuthorized: true,
			userId: token.id as string,
		};
	} catch (error) {
		console.error("Error verifying admin access:", error);
		return {
			isAuthorized: false,
			response: NextResponse.redirect(new URL("/unauthorized", request.url)),
		};
	}
};

/**
 * @description Server-side admin role check for use in server components and API routes
 * @param userId - The user ID to check
 * @returns True if the user is an admin, false otherwise
 */
export const checkAdminRole = async (userId: string): Promise<boolean> => {
	try {
		return await isUserAdmin(userId);
	} catch (error) {
		console.error("Error checking admin role:", error);
		return false;
	}
};

/**
 * @description Get user role for authorization purposes
 * @param userId - The user ID to get the role for
 * @returns The user role, or null if the user is not found or inactive
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
	try {
		const users = await getUserById(userId);
		if (users.length === 0) {
			return null;
		}

		const user = users[0];
		return user.status === "active" ? user.role : null;
	} catch (error) {
		console.error("Error getting user role:", error);
		return null;
	}
};
