import { NextRequest, NextResponse } from "next/server";

import { settingsService } from "@/app/(dashboard)/admin/settings/settings-service";

/**
 * Middleware to check if the system is in maintenance mode
 */
export const maintenanceModeMiddleware = async (
	request: NextRequest,
): Promise<NextResponse | null> => {
	try {
		const pathname = request.nextUrl.pathname;

		if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
			return null;
		}

		const isMaintenanceMode = await settingsService.isMaintenanceMode();

		if (isMaintenanceMode) {
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{
						error: "System is currently under maintenance. Please try again later.",
						maintenance: true,
					},
					{ status: 503 },
				);
			}

			return new NextResponse(
				`
				<!DOCTYPE html>
				<html>
				<head>
					<title>System Maintenance</title>
					<style>
						body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
						.maintenance { max-width: 500px; margin: 0 auto; }
						h1 { color: #333; }
						p { color: #666; }
					</style>
				</head>
				<body>
					<div class="maintenance">
						<h1>🔧 System Maintenance</h1>
						<p>We're currently performing scheduled maintenance to improve our services.</p>
						<p>Please check back in a few minutes.</p>
						<p>We apologize for any inconvenience.</p>
					</div>
				</body>
				</html>
				`,
				{
					status: 503,
					headers: {
						"Content-Type": "text/html",
						"Retry-After": "300",
					},
				},
			);
		}

		return null;
	} catch (error) {
		console.error("Error checking maintenance mode:", error);
		return null;
	}
};

/**
 * Check if a specific route should bypass maintenance mode
 */
export const shouldBypassMaintenance = (pathname: string): boolean => {
	const bypassRoutes = [
		"/admin",
		"/api/admin",
		"/api/settings",
		"/auth",
		"/login",
		"/health",
		"/status",
	];

	return bypassRoutes.some((route) => pathname.startsWith(route));
};
