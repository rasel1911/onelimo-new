import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const systemSettings = pgTable("system_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	category: text("category").notNull(), // 'workflow', 'notifications', 'security', 'system'
	key: text("key").notNull(),
	value: text("value").notNull(),
	dataType: text("data_type").notNull().default("string"), // 'string', 'number', 'boolean'
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const systemSettingsIndex = sql`CREATE UNIQUE INDEX IF NOT EXISTS system_settings_category_key_idx ON system_settings(category, key)`;

export const defaultSettings = [
	// Workflow settings
	{
		category: "workflow",
		key: "responseTimeoutMinutes",
		value: "30",
		dataType: "number",
		description: "How long to wait for initial provider responses",
	},
	{
		category: "workflow",
		key: "minProvidersToContact",
		value: "3",
		dataType: "number",
		description: "Minimum number of providers to contact initially",
	},
	{
		category: "workflow",
		key: "maxProvidersToContact",
		value: "5",
		dataType: "number",
		description: "Maximum number of providers to contact initially",
	},
	{
		category: "workflow",
		key: "retryAttempts",
		value: "3",
		dataType: "number",
		description: "Number of times to retry failed operations",
	},

	{
		category: "workflow",
		key: "responseCheckIntervalMinutes",
		value: "10",
		dataType: "number",
		description: "How often to check for new provider responses",
	},
	{
		category: "workflow",
		key: "minResponsesRequired",
		value: "1",
		dataType: "number",
		description: "Minimum number of provider responses required before proceeding",
	},

	// Notification settings
	{
		category: "notifications",
		key: "emailEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable email notifications",
	},
	{
		category: "notifications",
		key: "smsEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable SMS notifications",
	},
	{
		category: "notifications",
		key: "customerNotificationsEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable notifications for customers",
	},
	{
		category: "notifications",
		key: "providerNotificationsEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable notifications for providers",
	},
	{
		category: "notifications",
		key: "adminAlertsEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable admin alerts",
	},
	// Security settings
	{
		category: "security",
		key: "sessionTimeoutMinutes",
		value: "60",
		dataType: "number",
		description: "Session timeout in minutes",
	},
	{
		category: "security",
		key: "maxLoginAttempts",
		value: "5",
		dataType: "number",
		description: "Maximum login attempts before lockout",
	},
	// System settings
	{
		category: "system",
		key: "maintenanceMode",
		value: "false",
		dataType: "boolean",
		description: "Enable maintenance mode",
	},
	{
		category: "system",
		key: "debugMode",
		value: "false",
		dataType: "boolean",
		description: "Enable debug mode",
	},
	{
		category: "system",
		key: "logLevel",
		value: "info",
		dataType: "string",
		description: "System log level",
	},
	{
		category: "system",
		key: "dataRetentionDays",
		value: "365",
		dataType: "number",
		description: "Data retention period in days",
	},
	{
		category: "system",
		key: "backupEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable automated backups",
	},
	{
		category: "system",
		key: "analyticsEnabled",
		value: "true",
		dataType: "boolean",
		description: "Enable analytics collection",
	},
] as const;

export type SystemSettingsCategory = "workflow" | "notifications" | "security" | "system";

export interface WorkflowSettings {
	responseTimeoutMinutes: number;
	minProvidersToContact: number;
	maxProvidersToContact: number;
	retryAttempts: number;
	responseCheckIntervalMinutes: number;
	minResponsesRequired: number;
}

export interface NotificationSettings {
	emailEnabled: boolean;
	smsEnabled: boolean;
	customerNotificationsEnabled: boolean;
	providerNotificationsEnabled: boolean;
	adminAlertsEnabled: boolean;
}

export interface SecuritySettings {
	sessionTimeoutMinutes: number;
	maxLoginAttempts: number;
}

export interface SystemSettings {
	maintenanceMode: boolean;
	debugMode: boolean;
	logLevel: string;
	dataRetentionDays: number;
	backupEnabled: boolean;
	analyticsEnabled: boolean;
}

export interface AllSettings {
	workflow: WorkflowSettings;
	notifications: NotificationSettings;
	security: SecuritySettings;
	system: SystemSettings;
}
