"use server";

import { getAllCityNames } from "@/db/queries/location.queries";

export const fetchCitiesAction = async (force = false): Promise<string[]> => {
	try {
		const cities = await getAllCityNames(force);
		return cities;
	} catch (error) {
		console.error("Failed to fetch cities:", error);
		throw new Error("Failed to fetch cities");
	}
};
