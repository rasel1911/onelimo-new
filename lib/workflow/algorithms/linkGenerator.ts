import { PROVIDER_LINK_CONFIG, PROVIDER_LINK_ERRORS } from "../constants/provider-link";
import { QUOTE_LINK_CONFIG, QUOTE_LINK_ERRORS } from "../constants/quote-link";
import {
	ProviderLinkParams,
	HashData,
	GeneratedProviderLink,
	DecodedProviderLink,
} from "../types/provider-link";
import {
	QuoteLinkParams,
	QuoteHashData,
	GeneratedQuoteLink,
	DecodedQuoteLink,
} from "../types/quote-link";

/**
 * Create a hash from the data using Web Crypto API
 * @param data - The data to hash
 * @returns the hash
 */
export const createHash = async (data: string): Promise<string> => {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = new Uint8Array(hashBuffer);
	const hashHex = Array.from(hashArray)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashHex.substring(0, 10);
};

/**
 * Derive a cryptographic key from the secret key
 * @returns the derived key
 */
const deriveKey = async (): Promise<CryptoKey> => {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(PROVIDER_LINK_CONFIG.ENCRYPTION_KEY);

	const hashedKey = await crypto.subtle.digest("SHA-256", keyData);

	return await crypto.subtle.importKey("raw", hashedKey, { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	]);
};

/**
 * Encrypt the data using AES-GCM
 * @param text - The data to encrypt
 * @returns the encrypted data with IV prepended
 */
export const encrypt = async (text: string): Promise<string> => {
	try {
		const encoder = new TextEncoder();
		const data = encoder.encode(text);

		const iv = crypto.getRandomValues(new Uint8Array(12));

		const key = await deriveKey();
		const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);

		const combined = new Uint8Array(iv.length + encrypted.byteLength);
		combined.set(iv);
		combined.set(new Uint8Array(encrypted), iv.length);

		return arrayBufferToBase64Url(combined.buffer);
	} catch (error) {
		throw new Error(PROVIDER_LINK_ERRORS.DECRYPTION_FAILED);
	}
};

/**
 * Decrypt the data using AES-GCM
 * @param encryptedData - The encrypted data with IV prepended
 * @returns the decrypted data
 */
export const decrypt = async (encryptedData: string): Promise<string> => {
	try {
		const combined = base64UrlToArrayBuffer(encryptedData);

		const iv = combined.slice(0, 12);
		const encrypted = combined.slice(12);

		const key = await deriveKey();
		const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted);

		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	} catch (error) {
		throw new Error(PROVIDER_LINK_ERRORS.DECRYPTION_FAILED);
	}
};

/**
 * Convert ArrayBuffer to base64url string
 * @param buffer - The ArrayBuffer to convert
 * @returns base64url string
 */
const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	const base64 = btoa(binary);
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

/**
 * Convert base64url string to ArrayBuffer
 * @param base64url - The base64url string to convert
 * @returns ArrayBuffer
 */
const base64UrlToArrayBuffer = (base64url: string): ArrayBuffer => {
	let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

	while (base64.length % 4) {
		base64 += "=";
	}

	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes.buffer;
};

/**
 * Check if the link is expired
 * @param expiresAt - The date and time the link expires
 * @returns true if the link is expired, false otherwise
 */
export const isLinkExpired = (expiresAt: Date): boolean => {
	return new Date() > expiresAt;
};

// ================================================ //
// PROVIDER LINK GENERATION
// ================================================ //
/**
 * Generate a provider link
 * @param params - The parameters for the provider link
 * @returns the generated provider link
 */
export const generateProviderLink = async (
	params: ProviderLinkParams,
): Promise<GeneratedProviderLink> => {
	const { bookingRequestId, providerId, workflowProviderId } = params;

	if (!bookingRequestId || !providerId || !workflowProviderId) {
		throw new Error(PROVIDER_LINK_ERRORS.INVALID_PARAMS);
	}

	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + PROVIDER_LINK_CONFIG.EXPIRATION_HOURS);

	const hashData: HashData = {
		bookingRequestId,
		providerId,
		workflowProviderId,
		expiresAt: expiresAt.getTime(),
	};

	const dataString = JSON.stringify(hashData);
	const encryptedData = await encrypt(dataString);

	const hash = await createHash(encryptedData);
	const finalHash = hash.substring(0, Math.min(PROVIDER_LINK_CONFIG.HASH_LENGTH_MAX, hash.length));

	const url = `${PROVIDER_LINK_CONFIG.URL_PREFIX}/${finalHash}`;

	return {
		hash: finalHash,
		url,
		encryptedData,
		expiresAt,
	};
};

/**
 * Decode the provider link from the encrypted data
 * @param encryptedData - The encrypted data
 * @returns the decoded provider link
 */
export const decodeProviderLinkFromData = async (
	encryptedData: string,
): Promise<DecodedProviderLink> => {
	try {
		const decryptedData = await decrypt(encryptedData);
		const hashData: HashData = JSON.parse(decryptedData);

		const expiresAt = new Date(hashData.expiresAt);
		const isExpired = isLinkExpired(expiresAt);

		return {
			bookingRequestId: hashData.bookingRequestId,
			providerId: hashData.providerId,
			workflowProviderId: hashData.workflowProviderId,
			expiresAt,
			isExpired,
		};
	} catch (error) {
		throw new Error(PROVIDER_LINK_ERRORS.DECRYPTION_FAILED);
	}
};

// ================================================ //
// QUOTE LINK GENERATION
// ================================================ //
/**
 * Generate a quote link for customer to view quotes
 * @param params - The parameters for the quote link
 * @returns the generated quote link
 */
export const generateQuoteLink = async (params: QuoteLinkParams): Promise<GeneratedQuoteLink> => {
	const { bookingRequestId, workflowRunId, selectedQuoteIds } = params;

	if (!bookingRequestId || !workflowRunId || !selectedQuoteIds?.length) {
		throw new Error(QUOTE_LINK_ERRORS.INVALID_PARAMS);
	}

	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + QUOTE_LINK_CONFIG.EXPIRATION_HOURS);

	const hashData: QuoteHashData = {
		bookingRequestId,
		workflowRunId,
		selectedQuoteIds,
		expiresAt: expiresAt.getTime(),
	};

	const dataString = JSON.stringify(hashData);
	const encryptedData = await encrypt(dataString);

	const hash = await createHash(encryptedData);
	const finalHash = hash.substring(0, Math.min(QUOTE_LINK_CONFIG.HASH_LENGTH_MAX, hash.length));

	const url = `${QUOTE_LINK_CONFIG.URL_PREFIX}/${finalHash}`;

	return {
		hash: finalHash,
		url,
		encryptedData,
		expiresAt,
	};
};

/**
 * Decode the quote link from the encrypted data
 * @param encryptedData - The encrypted data
 * @returns the decoded quote link
 */
export const decodeQuoteLinkFromData = async (encryptedData: string): Promise<DecodedQuoteLink> => {
	try {
		const decryptedData = await decrypt(encryptedData);
		const hashData: QuoteHashData = JSON.parse(decryptedData);

		const expiresAt = new Date(hashData.expiresAt);
		const isExpired = isLinkExpired(expiresAt);

		return {
			bookingRequestId: hashData.bookingRequestId,
			workflowRunId: hashData.workflowRunId,
			selectedQuoteIds: hashData.selectedQuoteIds,
			expiresAt,
			isExpired,
		};
	} catch (error) {
		throw new Error(QUOTE_LINK_ERRORS.DECRYPTION_FAILED);
	}
};
