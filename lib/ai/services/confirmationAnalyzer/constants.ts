export const CONFIRMATION_ANALYZER_CONFIG = {
	MAX_RETRIES: 3,
	TEMPERATURE: 0.3,
	MAX_TOKENS: 2048,
	TIMEOUT_MS: 30000,
} as const;

export const INTENT_PATTERNS = {
	CONFIRMATION: [
		"confirm",
		"yes",
		"proceed",
		"book",
		"accept",
		"agree",
		"sounds good",
		"perfect",
		"great",
		"ok",
		"okay",
	],
	QUESTION: ["what", "when", "where", "how", "why", "can you", "could you", "would you", "?"],
	CONCERN: [
		"worried",
		"concern",
		"problem",
		"issue",
		"wrong",
		"but",
		"however",
		"though",
		"although",
	],
	CANCELLATION: [
		"cancel",
		"no thanks",
		"not interested",
		"changed my mind",
		"don't want",
		"decline",
		"reject",
	],
} as const;

export const URGENCY_KEYWORDS = {
	HIGH: ["urgent", "asap", "immediately", "emergency", "rush", "critical"],
	MEDIUM: ["soon", "today", "tomorrow", "quickly", "fast"],
	LOW: ["when convenient", "no rush", "whenever", "later"],
} as const;

export const CONTACT_PATTERNS = {
	EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
	PHONE: /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
	NAME: /my name is ([A-Za-z\s]+)/i,
} as const;
