import { z } from "zod";

/**
 * Prevent NoSQL injection and limit string lengths
 */
export const safeString = (maxLength: number = 100) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.refine((val) => !val.includes("$"), "Invalid characters detected")
		.refine((val) => !val.includes("{{"), "Invalid template syntax detected");

export const safeUuid = z.string().uuid();

/**
 * Admin query parameters validation
 */
export const adminQuerySchema = z.object({
	page: z.coerce.number().int().min(1).max(1000).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	search: z.string().trim().max(100).optional(),
	sortBy: z.enum(["id", "createdAt", "updatedAt", "name", "email"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Booking-related validation schemas
 */
export const bookingQuerySchema = adminQuerySchema.extend({
	status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
	dateFrom: z.string().datetime().optional(),
	dateTo: z.string().datetime().optional(),
});

/**
 * Settings validation schemas with business constraints
 */
export const workflowSettingsSchema = z.object({
	responseTimeoutMinutes: z.number().int().min(5).max(180),
	maxProvidersToContact: z.number().int().min(1).max(20),
	retryAttempts: z.number().int().min(0).max(10),
	fallbackTimeoutMinutes: z.number().int().min(30).max(480),
	responseCheckIntervalMinutes: z.number().int().min(1).max(60),
	maxResponseChecks: z.number().int().min(1).max(10),
});

export const notificationSettingsSchema = z.object({
	emailEnabled: z.boolean(),
	smsEnabled: z.boolean(),
	pushEnabled: z.boolean(),
	customerNotificationsEnabled: z.boolean(),
	providerNotificationsEnabled: z.boolean(),
	adminAlertsEnabled: z.boolean(),
});

export const securitySettingsSchema = z.object({
	twoFactorRequired: z.boolean(),
	sessionTimeoutMinutes: z.number().int().min(15).max(1440),
	maxLoginAttempts: z.number().int().min(3).max(20),
	passwordMinLength: z.number().int().min(6).max(50),
	requireSpecialChars: z.boolean(),
});

export const systemSettingsSchema = z.object({
	maintenanceMode: z.boolean(),
	debugMode: z.boolean(),
	logLevel: z.enum(["error", "warn", "info", "debug", "trace"]),
	dataRetentionDays: z.number().int().min(30).max(2555),
	backupEnabled: z.boolean(),
	analyticsEnabled: z.boolean(),
});

export const adminSettingsSchema = z.object({
	workflow: workflowSettingsSchema,
	notifications: notificationSettingsSchema,
	security: securitySettingsSchema,
	system: systemSettingsSchema,
});

/**
 * Audit log schemas
 */
export const auditLogSchema = z.object({
	action: safeString(50),
	resource: safeString(50),
	resourceId: safeString(50).optional(),
	userId: safeUuid,
	details: z.record(z.any()).optional(),
	timestamp: z.date().default(() => new Date()),
});

/**
 * Request validation helpers
 */
export const validateAdminRequest = <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } => {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error };
};
