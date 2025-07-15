export const PROVIDER_LINK_CONFIG = {
	EXPIRATION_HOURS: 24,
	HASH_LENGTH_MIN: 6,
	HASH_LENGTH_MAX: 12,
	URL_PREFIX: "/bq",
	ENCRYPTION_KEY: process.env.PROVIDER_LINK_SECRET || "fallback-secret-key-for-development-only",
	ALGORITHM: "aes-256-gcm",
} as const;

export const PROVIDER_LINK_ERRORS = {
	INVALID_HASH: "Invalid or malformed hash",
	EXPIRED_LINK: "Provider link has expired",
	DECRYPTION_FAILED: "Failed to decrypt hash data",
	INVALID_PARAMS: "Invalid parameters provided",
} as const;
