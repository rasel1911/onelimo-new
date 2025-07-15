import { tool } from "ai";
import { z } from "zod";

import { ERROR_MESSAGES, TIME_FORMATS } from "../constants";
import { isValidBookingTime, formatDate } from "../utils";
import { parseNaturalLanguageDate } from "../utils/parse-natural-date";

export const validateDateTimeTool = tool({
	description:
		"Validate and format a date and time for booking. Handles natural language like 'today', 'tomorrow', 'next Monday', etc.",
	parameters: z.object({
		dateTime: z.string().describe("Date and time string to validate (supports natural language)"),
		type: z.enum(["pickup", "dropoff"]).describe("Whether this is for pickup or dropoff"),
	}),
	execute: async ({ dateTime, type }) => {
		console.log("📅 Validating datetime:", { dateTime, type });

		const now = new Date();
		const currentTimeString = now.toLocaleString(TIME_FORMATS.LOCALE, TIME_FORMATS.DATE_OPTIONS);

		try {
			let parsedDate = parseNaturalLanguageDate(dateTime);

			if (!parsedDate) {
				parsedDate = new Date(dateTime);
				if (isNaN(parsedDate.getTime())) {
					return {
						isValid: false,
						message: `${ERROR_MESSAGES.INVALID_DATETIME}`,
						currentDateTime: currentTimeString,
					};
				}
			}

			// Check if date is within acceptable range
			const validationResult = isValidBookingTime(parsedDate);
			if (!validationResult.isValid) {
				const errorMessage =
					validationResult.reason === "too_early"
						? `${ERROR_MESSAGES.BOOKING_TOO_EARLY} Current time is ${currentTimeString}.`
						: ERROR_MESSAGES.BOOKING_TOO_FAR;

				return {
					isValid: false,
					message: errorMessage,
					currentDateTime: currentTimeString,
				};
			}

			const formattedDateTime = formatDate(parsedDate);

			return {
				isValid: true,
				formattedDateTime: parsedDate.toISOString(),
				message: `${type.charAt(0).toUpperCase() + type.slice(1)} time confirmed for ${formattedDateTime}`,
				currentDateTime: currentTimeString,
				userInput: dateTime,
			};
		} catch (error) {
			return {
				isValid: false,
				message: ERROR_MESSAGES.INVALID_DATETIME,
				currentDateTime: currentTimeString,
			};
		}
	},
});
