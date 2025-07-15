import { tool } from "ai";
import { z } from "zod";

import { getAllCityNames } from "@/db/queries/location.queries";

import { VALID_CITIES, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import { isLocationServiced, isValidUKPostcode, formatPostcode, capitalize } from "../utils";

export const LocationSchema = z.object({
	locationType: z.enum(["pickup", "dropoff"]).describe("The type of location to validate"),
	cityName: z.string().describe("The city name to validate"),
	postCode: z.string().describe("The postal code to validate"),
});

/**
 * @description
 * Validates a location (city name and postal code) for luxury car service availability
 * Checks if the city is serviced and if the postcode is valid
 */
export const validateLocationTool = tool({
	description:
		"Validate a location (city name and postal code) for luxury car service availability",
	parameters: z.object({
		locationType: z.enum(["pickup", "dropoff"]).describe("The type of location to validate"),
		cityName: z.string().describe("The city name to validate"),
		postCode: z.string().describe("The postal code to validate"),
	}),
	execute: async ({ cityName, postCode, locationType }) => {
		console.log("🏙️ Validating location:", { cityName, postCode, locationType });

		if (locationType === "pickup") {
			let cities: readonly string[];
			try {
				const dbCities = await getAllCityNames();
				cities = dbCities.length > 0 ? (dbCities as readonly string[]) : VALID_CITIES;

				if (!isLocationServiced(cityName, cities)) {
					return {
						isValid: false,
						message: `${ERROR_MESSAGES.LOCATION_NOT_SERVICED} Please provide a different location.`,
						suggestions: Array.from(cities).slice(0, 5),
					};
				}
			} catch (err) {
				console.error("Failed to fetch city names from DB. Falling back to static list.", err);
				cities = VALID_CITIES;
			}
		}

		let formattedPostCode = postCode;
		if (postCode) {
			if (!isValidUKPostcode(postCode)) {
				return {
					isValid: false,
					message: `The postal code "${postCode}" ${ERROR_MESSAGES.INVALID_POSTCODE}`,
				};
			}
			formattedPostCode = formatPostcode(postCode);
		}

		const formattedCityName = capitalize(cityName);

		return {
			isValid: true,
			cityName: formattedCityName,
			formattedPostCode,
			message: `Great! We service ${formattedCityName}${formattedPostCode ? ` (${formattedPostCode})` : ""}. This ${SUCCESS_MESSAGES.LOCATION_CONFIRMED}.`,
		};
	},
});
