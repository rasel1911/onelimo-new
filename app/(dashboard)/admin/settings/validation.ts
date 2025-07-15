import { z } from "zod";

export const settingsFormSchema = z.object({
	workflow: z
		.object({
			responseTimeoutMinutes: z
				.number({ required_error: "Response timeout is required" })
				.min(1, "Response timeout must be at least 1 minute")
				.max(2800, "Response timeout cannot exceed 2800 minutes"),
			minProvidersToContact: z
				.number({ required_error: "Minimum providers is required" })
				.min(1, "Must contact at least 1 provider")
				.max(10, "Cannot exceed 10 providers"),
			maxProvidersToContact: z
				.number({ required_error: "Maximum providers is required" })
				.min(1, "Must contact at least 1 provider")
				.max(20, "Cannot exceed 20 providers"),
			retryAttempts: z
				.number({ required_error: "Retry attempts is required" })
				.min(0, "Retry attempts cannot be negative")
				.max(10, "Cannot exceed 10 retry attempts"),

			responseCheckIntervalMinutes: z
				.number({ required_error: "Response check interval is required" })
				.min(1, "Response check interval must be at least 1 minute")
				.max(60, "Response check interval cannot exceed 60 minutes"),
			minResponsesRequired: z
				.number({ required_error: "Minimum responses required is required" })
				.min(1, "Must require at least 1 response")
				.max(100, "Cannot require more than 100 responses"),
		})
		.refine((data) => data.maxProvidersToContact >= data.minProvidersToContact, {
			message: "Maximum providers must be greater than or equal to minimum providers",
			path: ["maxProvidersToContact"],
		}),
	notifications: z.object({
		emailEnabled: z.boolean(),
		smsEnabled: z.boolean(),
		customerNotificationsEnabled: z.boolean(),
		providerNotificationsEnabled: z.boolean(),
		adminAlertsEnabled: z.boolean(),
	}),
	security: z.object({
		sessionTimeoutMinutes: z
			.number({ required_error: "Session timeout is required" })
			.min(15, "Session timeout must be at least 15 minutes")
			.max(1440, "Session timeout cannot exceed 1440 minutes (24 hours)"),
		maxLoginAttempts: z
			.number({ required_error: "Max login attempts is required" })
			.min(3, "Must allow at least 3 login attempts")
			.max(20, "Cannot exceed 20 login attempts"),
	}),
	system: z.object({
		maintenanceMode: z.boolean(),
		debugMode: z.boolean(),
		logLevel: z.enum(["error", "warn", "info", "debug", "trace"], {
			required_error: "Log level is required",
			invalid_type_error: "Invalid log level",
		}),
		dataRetentionDays: z
			.number({ required_error: "Data retention period is required" })
			.min(30, "Data retention must be at least 30 days")
			.max(2555, "Data retention cannot exceed 2555 days (7 years)"),
		backupEnabled: z.boolean(),
		analyticsEnabled: z.boolean(),
	}),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
