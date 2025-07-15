import { randomBytes } from "crypto";

import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

export const generateSalt = (): string => {
	return genSaltSync(12);
};

export const hashPin = (pin: string, salt?: string): string => {
	const saltToUse = salt || genSaltSync(12);
	return hashSync(pin, saltToUse);
};

export const validatePin = (pin: string, hash: string): boolean => {
	return compareSync(pin, hash);
};

export const generateResetToken = (): string => {
	return randomBytes(32).toString("hex");
};

export const isValidPin = (pin: string): boolean => {
	return /^\d{4}$/.test(pin);
};

export const validatePinSecurity = (pin: string) => {
	const sequential =
		/^(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(pin);

	const repeating = /^(\d)\1{3}$/.test(pin);

	return {
		isValid: !sequential && !repeating,
		errors: [
			...(sequential ? ["PIN cannot be sequential numbers (e.g., 1234, 4321)"] : []),
			...(repeating ? ["PIN cannot be repeating numbers (e.g., 1111, 2222)"] : []),
		],
	};
};

export const MAX_PIN_ATTEMPTS = 3;
export const PIN_RESET_TOKEN_EXPIRY_HOURS = 24;
