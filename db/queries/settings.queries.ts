import { and, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "../connection";
import {
	AllSettings,
	defaultSettings,
	NotificationSettings,
	SecuritySettings,
	systemSettings,
	SystemSettingsCategory,
	SystemSettings,
	WorkflowSettings,
} from "../schema/settings.schema";

/**
 * Parse setting value based on data type
 * @param value - The value to parse
 * @param dataType - The data type of the value
 * @returns The parsed value
 */
const parseSettingValue = (value: string, dataType: string): number | string | boolean => {
	switch (dataType) {
		case "boolean":
			return value === "true";
		case "number":
			return parseInt(value, 10);
		case "string":
		default:
			return value;
	}
};

/**
 * Serialize setting value to string
 * @param value - The value to serialize
 * @returns The serialized value
 */
const serializeSettingValue = (value: number | string | boolean): string => {
	if (typeof value === "boolean") {
		return value.toString();
	}
	if (typeof value === "number") {
		return value.toString();
	}
	return String(value);
};

/**
 * Get all settings
 * @returns The settings
 */
export const getAllSettings = cache(async (): Promise<AllSettings> => {
	try {
		const settings = await db.select().from(systemSettings);

		// If no settings exist, initialize with defaults
		if (settings.length === 0) {
			await initializeDefaultSettings();
			return getAllSettings();
		}

		const groupedSettings: Record<SystemSettingsCategory, Record<string, any>> = {
			workflow: {},
			notifications: {},
			security: {},
			system: {},
		};

		settings.forEach((setting) => {
			const category = setting.category as SystemSettingsCategory;
			groupedSettings[category][setting.key] = parseSettingValue(setting.value, setting.dataType);
		});

		return {
			workflow: groupedSettings.workflow as WorkflowSettings,
			notifications: groupedSettings.notifications as NotificationSettings,
			security: groupedSettings.security as SecuritySettings,
			system: groupedSettings.system as SystemSettings,
		};
	} catch (error) {
		console.error("Error fetching settings:", error);
		throw new Error("Failed to fetch settings");
	}
});

/**
 * Get settings by category
 * @param category - The category of the settings
 * @returns The settings
 */
export const getSettingsByCategory = cache(
	async (category: SystemSettingsCategory): Promise<Record<string, any>> => {
		try {
			const settings = await db
				.select()
				.from(systemSettings)
				.where(eq(systemSettings.category, category));

			const result: Record<string, any> = {};
			settings.forEach((setting) => {
				result[setting.key] = parseSettingValue(setting.value, setting.dataType);
			});

			return result;
		} catch (error) {
			console.error(`Error fetching ${category} settings:`, error);
			throw new Error(`Failed to fetch ${category} settings`);
		}
	},
);

/**
 * Get a specific setting
 * @param category - The category of the setting
 * @param key - The key of the setting
 * @returns The setting
 */
export const getSetting = cache(
	async (category: SystemSettingsCategory, key: string): Promise<any> => {
		try {
			const setting = await db
				.select()
				.from(systemSettings)
				.where(and(eq(systemSettings.category, category), eq(systemSettings.key, key)))
				.limit(1);

			if (setting.length === 0) {
				return null;
			}

			return parseSettingValue(setting[0].value, setting[0].dataType);
		} catch (error) {
			console.error(`Error fetching setting ${category}.${key}:`, error);
			throw new Error(`Failed to fetch setting ${category}.${key}`);
		}
	},
);

/**
 * Update settings
 * @param settings - The settings to update
 */
export const updateSettings = async (settings: Partial<AllSettings>): Promise<void> => {
	try {
		const updates: Array<{
			category: SystemSettingsCategory;
			key: string;
			value: string;
		}> = [];

		Object.entries(settings).forEach(([category, categorySettings]) => {
			if (categorySettings) {
				Object.entries(categorySettings).forEach(([key, value]) => {
					updates.push({
						category: category as SystemSettingsCategory,
						key,
						value: serializeSettingValue(value),
					});
				});
			}
		});

		for (const update of updates) {
			await db
				.update(systemSettings)
				.set({
					value: update.value,
					updatedAt: new Date(),
				})
				.where(
					and(eq(systemSettings.category, update.category), eq(systemSettings.key, update.key)),
				);
		}
	} catch (error) {
		console.error("Error updating settings:", error);
		throw new Error("Failed to update settings");
	}
};

/**
 * Update a specific setting
 * @param category - The category of the setting
 * @param key - The key of the setting
 * @param value - The value to update
 */
export const updateSetting = async (
	category: SystemSettingsCategory,
	key: string,
	value: any,
): Promise<void> => {
	try {
		await db
			.update(systemSettings)
			.set({
				value: serializeSettingValue(value),
				updatedAt: new Date(),
			})
			.where(and(eq(systemSettings.category, category), eq(systemSettings.key, key)));
	} catch (error) {
		console.error(`Error updating setting ${category}.${key}:`, error);
		throw new Error(`Failed to update setting ${category}.${key}`);
	}
};

/**
 * Reset settings to defaults
 * @returns void
 */
export const resetSettingsToDefaults = async (): Promise<void> => {
	try {
		await db.delete(systemSettings);

		await initializeDefaultSettings();
	} catch (error) {
		console.error("Error resetting settings:", error);
		throw new Error("Failed to reset settings");
	}
};

/**
 * Initialize default settings
 * @returns void
 */
export const initializeDefaultSettings = async (): Promise<void> => {
	try {
		const settingsToInsert = defaultSettings.map((setting) => ({
			category: setting.category,
			key: setting.key,
			value: setting.value,
			dataType: setting.dataType,
			description: setting.description,
		}));

		await db.insert(systemSettings).values(settingsToInsert);
	} catch (error) {
		console.error("Error initializing default settings:", error);
		throw new Error("Failed to initialize default settings");
	}
};

/**
 * Check if settings are initialized
 * @returns true if settings are initialized, false otherwise
 */
export const areSettingsInitialized = async (): Promise<boolean> => {
	try {
		const count = await db.select().from(systemSettings).limit(1);
		return count.length > 0;
	} catch (error) {
		console.error("Error checking settings initialization:", error);
		return false;
	}
};

/**
 * Get default settings structure
 * @returns The default settings structure
 */
export const getDefaultSettingsStructure = (): AllSettings => {
	const grouped: Record<SystemSettingsCategory, Record<string, any>> = {
		workflow: {},
		notifications: {},
		security: {},
		system: {},
	};

	defaultSettings.forEach((setting) => {
		const category = setting.category as SystemSettingsCategory;
		grouped[category][setting.key] = parseSettingValue(setting.value, setting.dataType);
	});

	return {
		workflow: grouped.workflow as WorkflowSettings,
		notifications: grouped.notifications as NotificationSettings,
		security: grouped.security as SecuritySettings,
		system: grouped.system as SystemSettings,
	};
};
