import { eq, lt } from "drizzle-orm";

import { db } from "@/db";
import { registrationToken, RegistrationToken } from "@/db/schema";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "default-secret-key-change-in-production";

/**
 * Generate a secure random token with HMAC signature
 * that fits within the 100 character limit
 */
export async function generateToken(): Promise<string> {
	const randomArray = new Uint8Array(16);
	crypto.getRandomValues(randomArray);
	const randomData = Array.from(randomArray)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const encoder = new TextEncoder();
	const keyData = encoder.encode(TOKEN_SECRET);
	const messageData = encoder.encode(randomData);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
	const signatureArray = new Uint8Array(signatureBuffer);
	const fullSignature = Array.from(signatureArray)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const signature = fullSignature.substring(0, 32);

	return `${randomData}.${signature}`;
}

/**
 * Verify token signature
 */
async function verifyTokenSignature(token: string): Promise<boolean> {
	try {
		const [data, signature] = token.split(".");

		if (!data || !signature) {
			return false;
		}

		const encoder = new TextEncoder();
		const keyData = encoder.encode(TOKEN_SECRET);
		const messageData = encoder.encode(data);

		const cryptoKey = await crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);

		const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
		const signatureArray = new Uint8Array(signatureBuffer);
		const fullExpectedSignature = Array.from(signatureArray)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		const expectedSignature = fullExpectedSignature.substring(0, 32);

		return signature === expectedSignature;
	} catch (error) {
		console.error("Error verifying token signature:", error);
		return false;
	}
}

/**
 * Create a new registration token
 * @param email Optional email to associate with the token
 * @param expiryHours Number of hours until token expires (default: 48)
 */
export async function createRegistrationToken(
	email?: string,
	expiryHours: number = 48,
): Promise<{ token: string; id: string }> {
	const token = await generateToken();

	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + expiryHours);

	const result = await db
		.insert(registrationToken)
		.values({
			token,
			email,
			expiresAt,
			isUsed: false,
		})
		.returning({ id: registrationToken.id, token: registrationToken.token });

	return result[0];
}

/**
 * Validate a registration token
 * @param token The token to validate
 */
export async function validateToken(
	token: string,
): Promise<{ isValid: boolean; tokenRecord: RegistrationToken | null; reason?: string }> {
	try {
		if (!(await verifyTokenSignature(token))) {
			return { isValid: false, tokenRecord: null, reason: "Invalid token signature" };
		}

		const result = await db
			.select()
			.from(registrationToken)
			.where(eq(registrationToken.token, token));

		if (result.length === 0) {
			return { isValid: false, tokenRecord: null, reason: "Token not found" };
		}

		const tokenRecord = result[0];

		// Check if token is used
		if (tokenRecord.isUsed) {
			return { isValid: false, tokenRecord, reason: "Token has already been used" };
		}

		// Check if token is expired
		if (new Date() > tokenRecord.expiresAt) {
			return { isValid: false, tokenRecord, reason: "Token has expired" };
		}

		return { isValid: true, tokenRecord };
	} catch (error) {
		console.error("Error validating token:", error);
		return { isValid: false, tokenRecord: null, reason: "Server error during validation" };
	}
}

/**
 * Mark a token as used
 * @param token The token to mark as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
	try {
		const result = await db
			.update(registrationToken)
			.set({
				isUsed: true,
				updatedAt: new Date(),
			})
			.where(eq(registrationToken.token, token))
			.returning({ id: registrationToken.id });

		return result.length > 0;
	} catch (error) {
		console.error("Error marking token as used:", error);
		return false;
	}
}

/**
 * Get all registration tokens
 */
export async function getRegistrationTokens(): Promise<RegistrationToken[]> {
	return await db.select().from(registrationToken);
}

/**
 * Delete expired tokens to clean up the database
 */
export async function deleteExpiredTokens(): Promise<number> {
	const now = new Date();

	const result = await db
		.delete(registrationToken)
		.where(lt(registrationToken.expiresAt, now))
		.returning({ id: registrationToken.id });

	return result.length;
}
