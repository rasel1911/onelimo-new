const AI_CONFIG = {
	defaultTemperature: 0.2,
	defaultMaxTokens: 2500,
	fallbackTemperature: 0.3,
	fallbackMaxTokens: 2500,
} as const;

export const MODEL_IDS = {
	GEMINI_FLASH_2_5: "gemini-2.5-flash",
	GEMINI_FLASH_2_0: "gemini-2.0-flash",
	GEMINI_FLASH_LITE_2_0: "gemini-2.0-flash-lite",
	GEMINI_FLASH_LITE_2_5: "gemini-2.5-flash-lite-preview-06-17",
	GEMINI_PRO: "gemini-2.5-pro",
	BOOKING_ANALYZER: "booking-analyzer",
	RESPONSE_ANALYZER: "response-analyzer",
	CUSTOMER_SUMMARY: "customer-summary",
	FALLBACK: "fallback-model",
} as const;

export const MODEL_SETTINGS = {
	[MODEL_IDS.BOOKING_ANALYZER]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.RESPONSE_ANALYZER]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.CUSTOMER_SUMMARY]: {
		temperature: AI_CONFIG.fallbackTemperature,
		maxTokens: AI_CONFIG.fallbackMaxTokens,
	},
	[MODEL_IDS.FALLBACK]: {
		temperature: AI_CONFIG.fallbackTemperature,
		maxTokens: AI_CONFIG.fallbackMaxTokens,
	},
	[MODEL_IDS.GEMINI_FLASH_2_0]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.GEMINI_FLASH_LITE_2_0]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.GEMINI_FLASH_2_5]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.GEMINI_FLASH_LITE_2_5]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
	[MODEL_IDS.GEMINI_PRO]: {
		temperature: AI_CONFIG.defaultTemperature,
		maxTokens: AI_CONFIG.defaultMaxTokens,
	},
} as const;

/**
 * Model configuration utilities
 */
export const getModelSettings = (modelId: keyof typeof MODEL_IDS) => {
	const modelKey = MODEL_IDS[modelId];
	return MODEL_SETTINGS[modelKey as keyof typeof MODEL_SETTINGS];
};

export type ModelId = keyof typeof MODEL_IDS;
export type AIConfig = typeof AI_CONFIG;
