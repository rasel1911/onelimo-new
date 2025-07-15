/**
 * Constants for booking analysis scoring and penalties
 */
export const SCORING_PENALTIES = {
	CONTACT_VIOLATION: {
		LOW: 10,
		MEDIUM: 20,
		HIGH: 35,
	},
} as const;

/**
 * AI model configuration for contact analysis
 */
export const CONTACT_ANALYSIS_CONFIG = {
	TEMPERATURE: 0.4,
	MAX_TOKENS: 2000,
	MAX_RETRIES: 3,
} as const;

/**
 * Default values for empty or invalid inputs
 */
export const DEFAULT_VALUES = {
	EMPTY_CONTACT_ANALYSIS: {
		hasContactDetails: false,
		cleanedMessage: "",
		contactTypes: [] as string[],
		severity: "low" as const,
	},
} as const;
