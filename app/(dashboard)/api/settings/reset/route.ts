import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getAllSettings, resetSettingsToDefaults } from "@/db/queries/settings.queries";
import { isUserAdmin } from "@/db/queries/user.queries";
import { auditLogger, createAuditContext } from "@/lib/audit/audit-logger";
import { adminRateLimiter } from "@/lib/middleware/rate-limit";

// POST /api/settings/reset
export const POST = async (request: NextRequest) => {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const isAdmin = await isUserAdmin(session.user.id);
		if (!isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const rateLimitResult = await adminRateLimiter(request);
		if (!rateLimitResult.isAllowed) {
			return rateLimitResult.response!;
		}

		await resetSettingsToDefaults();

		await auditLogger.logConfigChange(
			"system_settings",
			createAuditContext(session.user.id, request),
			{
				newValue: "reset_to_defaults",
			},
		);

		const resetSettings = await getAllSettings();

		return NextResponse.json(resetSettings, {
			headers: {
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Error resetting settings:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
};
