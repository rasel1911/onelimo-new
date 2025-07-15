export const QUOTE_LINK_CONFIG = {
	EXPIRATION_HOURS: 24,
	HASH_LENGTH_MIN: 6,
	HASH_LENGTH_MAX: 12,
	URL_PREFIX: "/bq/quotes",
	ENCRYPTION_KEY:
		process.env.QUOTE_LINK_SECRET ||
		process.env.PROVIDER_LINK_SECRET ||
		"fallback-secret-key-for-development-only",
	ALGORITHM: "aes-256-gcm",
} as const;

export const QUOTE_LINK_ERRORS = {
	INVALID_HASH: "Invalid or malformed hash",
	EXPIRED_LINK: "Quote link has expired",
	DECRYPTION_FAILED: "Failed to decrypt hash data",
	ENCRYPTION_FAILED: "Failed to encrypt hash data",
	INVALID_PARAMS: "Invalid parameters provided",
} as const;
