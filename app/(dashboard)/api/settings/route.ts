import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";
import { getAllSettings, updateSettings } from "@/db/queries/settings.queries";
import { isUserAdmin } from "@/db/queries/user.queries";
import { auditLogger, createAuditContext } from "@/lib/audit/audit-logger";
import { adminRateLimiter } from "@/lib/middleware/rate-limit";

// Validation schema for settings
const settingsSchema = z.object({
	workflow: z
		.object({
			responseTimeoutMinutes: z.number().min(1).max(2800),
			minProvidersToContact: z.number().min(1).max(10),
			maxProvidersToContact: z.number().min(1).max(20),
			retryAttempts: z.number().min(0).max(10),

			responseCheckIntervalMinutes: z.number().min(1).max(60),
			minResponsesRequired: z.number().min(1).max(100),
		})
		.optional(),
	notifications: z
		.object({
			emailEnabled: z.boolean(),
			smsEnabled: z.boolean(),
			customerNotificationsEnabled: z.boolean(),
			providerNotificationsEnabled: z.boolean(),
			adminAlertsEnabled: z.boolean(),
		})
		.optional(),
	security: z
		.object({
			sessionTimeoutMinutes: z.number().min(15).max(1440),
			maxLoginAttempts: z.number().min(3).max(20),
		})
		.optional(),
	system: z
		.object({
			maintenanceMode: z.boolean(),
			debugMode: z.boolean(),
			logLevel: z.enum(["error", "warn", "info", "debug", "trace"]),
			dataRetentionDays: z.number().min(30).max(2555),
			backupEnabled: z.boolean(),
			analyticsEnabled: z.boolean(),
		})
		.optional(),
});

// GET /api/settings
export const GET = async (request: NextRequest) => {
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

		const settings = await getAllSettings();

		await auditLogger.logDataAccess(
			"system_settings",
			"read",
			createAuditContext(session.user.id, request),
		);

		return NextResponse.json(settings, {
			headers: {
				"Cache-Control": "private, max-age=600",
			},
		});
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
};

// POST /api/settings
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

		const body = await request.json();
		const validatedSettings = settingsSchema.parse(body);

		await updateSettings(validatedSettings);

		await auditLogger.logConfigChange(
			"system_settings",
			createAuditContext(session.user.id, request),
			{
				newValue: validatedSettings,
			},
		);

		const updatedSettings = await getAllSettings();

		return NextResponse.json(updatedSettings, {
			headers: {
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Error updating settings:", error);

		if (error instanceof z.ZodError) {
			// Format validation errors for client-side form handling
			const fieldErrors: Record<string, string[]> = {};

			error.errors.forEach((err) => {
				const path = err.path.join(".");
				if (!fieldErrors[path]) {
					fieldErrors[path] = [];
				}
				fieldErrors[path].push(err.message);
			});

			return NextResponse.json(
				{
					error: "Validation failed",
					fieldErrors,
					details: error.errors,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
};
