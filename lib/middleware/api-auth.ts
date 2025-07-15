import { NextRequest, NextResponse } from "next/server";

import { getServiceProviderById } from "@/db/queries/serviceProvider.queries";

import { getSessionFromRequest, validatePinSession } from "./pin-auth";

export interface AuthenticatedRequest extends NextRequest {
	providerId: string;
	provider: {
		id: string;
		name: string;
		email: string;
	};
}

/**
 * @description Middleware to require provider authentication
 * @param handler - The handler function to call if authentication is successful
 * @returns A middleware function that checks if the provider ID matches the provided ID
 */
export const withPinAuth = (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) => {
	return async (request: NextRequest): Promise<NextResponse> => {
		try {
			const session = getSessionFromRequest(request);

			if (!validatePinSession(session)) {
				return NextResponse.json(
					{
						success: false,
						error: "Authentication required",
						requiresAuth: true,
					},
					{ status: 401 },
				);
			}

			// Verify provider exists
			const provider = await getServiceProviderById(session!.providerId);

			if (!provider) {
				return NextResponse.json(
					{
						success: false,
						error: "Provider not found",
						requiresAuth: true,
					},
					{ status: 404 },
				);
			}

			// Check if provider is blocked
			if (provider.isBlocked === "true") {
				return NextResponse.json(
					{
						success: false,
						error: "Account is blocked. Please reset your PIN.",
						blocked: true,
						requiresAuth: true,
					},
					{ status: 423 },
				);
			}

			// Attach provider info to request
			const authenticatedRequest = request as AuthenticatedRequest;
			authenticatedRequest.providerId = session!.providerId;
			authenticatedRequest.provider = {
				id: provider.id,
				name: provider.name,
				email: provider.email,
			};

			return await handler(authenticatedRequest);
		} catch (error) {
			console.error("Authentication middleware error:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Authentication failed",
					requiresAuth: true,
				},
				{ status: 500 },
			);
		}
	};
};

/**
 * @description Middleware to require provider authentication
 * @param providerId - The provider ID to check
 * @returns A middleware function that checks if the provider ID matches the provided ID
 */
export const requireProviderAuth = (providerId: string) => {
	return (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) => {
		return withPinAuth(async (request: AuthenticatedRequest) => {
			if (request.providerId !== providerId) {
				return NextResponse.json(
					{
						success: false,
						error: "Access denied for this provider",
						requiresAuth: true,
					},
					{ status: 403 },
				);
			}

			return await handler(request);
		});
	};
};
