import { cache } from "react";

import { getAllSettings, getSetting, getSettingsByCategory } from "@/db/queries/settings.queries";
import {
	AllSettings,
	NotificationSettings,
	SecuritySettings,
	SystemSettings,
	WorkflowSettings,
} from "@/db/schema/settings.schema";

class SettingsService {
	/**
	 * Get all system settings
	 * @returns All settings
	 */
	async getAll(): Promise<AllSettings> {
		return await getAllSettings();
	}

	/**
	 * Get workflow settings
	 * @returns Workflow settings
	 */
	async getWorkflowSettings(): Promise<WorkflowSettings> {
		const settings = await getSettingsByCategory("workflow");
		return settings as WorkflowSettings;
	}

	/**
	 * Get notification settings
	 * @returns Notification settings
	 */
	async getNotificationSettings(): Promise<NotificationSettings> {
		const settings = await getSettingsByCategory("notifications");
		return settings as NotificationSettings;
	}

	/**
	 * Get security settings
	 * @returns Security settings
	 */
	async getSecuritySettings(): Promise<SecuritySettings> {
		const settings = await getSettingsByCategory("security");
		return settings as SecuritySettings;
	}

	/**
	 * Get system settings
	 * @returns System settings
	 */
	async getSystemSettings(): Promise<SystemSettings> {
		const settings = await getSettingsByCategory("system");
		return settings as SystemSettings;
	}

	/**
	 * Check if email notifications are enabled
	 * @returns true if email notifications are enabled, false otherwise
	 */
	async isEmailEnabled(): Promise<boolean> {
		return await getSetting("notifications", "emailEnabled");
	}

	/**
	 * Check if SMS notifications are enabled
	 * @returns true if SMS notifications are enabled, false otherwise
	 */
	async isSMSEnabled(): Promise<boolean> {
		return await getSetting("notifications", "smsEnabled");
	}

	/**
	 * Check if customer notifications are enabled
	 * @returns true if customer notifications are enabled, false otherwise
	 */
	async areCustomerNotificationsEnabled(): Promise<boolean> {
		return await getSetting("notifications", "customerNotificationsEnabled");
	}

	/**
	 * Check if provider notifications are enabled
	 * @returns true if provider notifications are enabled, false otherwise
	 */
	async areProviderNotificationsEnabled(): Promise<boolean> {
		return await getSetting("notifications", "providerNotificationsEnabled");
	}

	/**
	 * Check if admin alerts are enabled
	 * @returns true if admin alerts are enabled, false otherwise
	 */
	async areAdminAlertsEnabled(): Promise<boolean> {
		return await getSetting("notifications", "adminAlertsEnabled");
	}

	/**
	 * Get session timeout in minutes
	 * @returns Session timeout in minutes
	 */
	async getSessionTimeout(): Promise<number> {
		return await getSetting("security", "sessionTimeoutMinutes");
	}

	/**
	 * Get maximum login attempts
	 * @returns Maximum login attempts
	 */
	async getMaxLoginAttempts(): Promise<number> {
		return await getSetting("security", "maxLoginAttempts");
	}

	/**
	 * Check if system is in maintenance mode
	 * @returns true if system is in maintenance mode, false otherwise
	 */
	async isMaintenanceMode(): Promise<boolean> {
		return await getSetting("system", "maintenanceMode");
	}

	/**
	 * Check if debug mode is enabled
	 * @returns true if debug mode is enabled, false otherwise
	 */
	async isDebugMode(): Promise<boolean> {
		return await getSetting("system", "debugMode");
	}

	/**
	 * Get current log level
	 * @returns Current log level
	 */
	async getLogLevel(): Promise<string> {
		return await getSetting("system", "logLevel");
	}

	/**
	 * Get data retention period in days
	 * @returns Data retention period in days
	 */
	async getDataRetentionDays(): Promise<number> {
		return await getSetting("system", "dataRetentionDays");
	}

	/**
	 * Get workflow configuration for the workflow engine
	 * @returns Workflow configuration
	 */
	async getWorkflowConfig(): Promise<{
		responseTimeoutMinutes: number;
		minProvidersToContact: number;
		maxProvidersToContact: number;
		retryAttempts: number;
		responseCheckIntervalMinutes: number;
		minResponsesRequired: number;
	}> {
		const workflowSettings = await this.getWorkflowSettings();
		return {
			responseTimeoutMinutes: workflowSettings.responseTimeoutMinutes,
			minProvidersToContact: workflowSettings.minProvidersToContact,
			maxProvidersToContact: workflowSettings.maxProvidersToContact,
			retryAttempts: workflowSettings.retryAttempts,
			responseCheckIntervalMinutes: workflowSettings.responseCheckIntervalMinutes,
			minResponsesRequired: workflowSettings.minResponsesRequired,
		};
	}

	/**
	 * Get notification configuration for the communication system
	 * @returns Notification configuration
	 */
	async getNotificationConfig(): Promise<{
		emailEnabled: boolean;
		smsEnabled: boolean;
		customerNotificationsEnabled: boolean;
		providerNotificationsEnabled: boolean;
		adminAlertsEnabled: boolean;
	}> {
		const notificationSettings = await this.getNotificationSettings();
		return {
			emailEnabled: notificationSettings.emailEnabled,
			smsEnabled: notificationSettings.smsEnabled,
			customerNotificationsEnabled: notificationSettings.customerNotificationsEnabled,
			providerNotificationsEnabled: notificationSettings.providerNotificationsEnabled,
			adminAlertsEnabled: notificationSettings.adminAlertsEnabled,
		};
	}
}

export const settingsService = new SettingsService();

export const getCachedWorkflowSettings = cache(async () => {
	return await settingsService.getWorkflowSettings();
});

export const getCachedNotificationSettings = cache(async () => {
	return await settingsService.getNotificationSettings();
});

export const getCachedSecuritySettings = cache(async () => {
	return await settingsService.getSecuritySettings();
});

export const getCachedSystemSettings = cache(async () => {
	return await settingsService.getSystemSettings();
});

export const getCachedAllSettings = cache(async () => {
	return await settingsService.getAll();
});
