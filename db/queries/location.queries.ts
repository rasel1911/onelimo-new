import { eq } from "drizzle-orm";

import db from "@/db/connection";

import { Location, location } from "../schema/location.schema";
import { serviceProvider } from "../schema/serviceProvider.schema";

/**
 * @description
 * Gets all locations from the database
 * @returns All locations.
 */
export const getAllLocations = async (): Promise<Location[]> => {
	return await db.select().from(location);
};

/**
 * @description
 * Gets a location by ID
 * @param id - The ID of the location to get.
 * @returns The location.
 */
export const getLocationById = async (id: string): Promise<Location | undefined> => {
	const results = await db.select().from(location).where(eq(location.id, id));

	return results[0];
};

/**
 * @description
 * Creates a location in the database
 * @param data - The data to create the location with.
 * @returns The created location.
 */
export const createLocation = async (
	data: Omit<typeof location.$inferInsert, "id" | "createdAt" | "updatedAt">,
): Promise<Location> => {
	const result = await db
		.insert(location)
		.values({
			...data,
		})
		.returning();

	return result[0];
};

/**
 * @description
 * Updates a location in the database
 * @param id - The ID of the location to update.
 * @param data - The data to update the location with.
 * @returns The updated location.
 */
export const updateLocation = async (
	id: string,
	data: Partial<Omit<typeof location.$inferInsert, "id" | "createdAt" | "updatedAt">>,
): Promise<Location | undefined> => {
	const result = await db
		.update(location)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(location.id, id))
		.returning();

	return result[0];
};

/**
 * @description
 * Gets or creates the "Unavailable Location" entry
 * @returns The unavailable location.
 */
export const getOrCreateUnavailableLocation = async (): Promise<Location> => {
	const unavailableLocation = await db
		.select()
		.from(location)
		.where(eq(location.city, "Unavailable Location"));

	if (unavailableLocation.length > 0) {
		return unavailableLocation[0];
	}

	const result = await db
		.insert(location)
		.values({
			city: "Unavailable Location",
			zipcodes: ["N/A"],
		})
		.returning();

	return result[0];
};

/**
 * @description
 * Deletes a location from the database
 * @param id - The ID of the location to delete.
 * @returns The deleted location.
 */
export const deleteLocation = async (id: string) => {
	try {
		const serviceProvidersUsingLocation = await db
			.select()
			.from(serviceProvider)
			.where(eq(serviceProvider.locationId, id));

		// If service providers are using this location, update them to use the "Unavailable Location"
		if (serviceProvidersUsingLocation.length > 0) {
			const unavailableLocation = await getOrCreateUnavailableLocation();

			await db
				.update(serviceProvider)
				.set({
					locationId: unavailableLocation.id,
					updatedAt: new Date(),
				})
				.where(eq(serviceProvider.locationId, id));
		}

		return await db.delete(location).where(eq(location.id, id));
	} catch (error) {
		console.error("Failed to delete location from database");
		throw error;
	}
};

let cachedCityNames: string[] | null = null;
let lastCityFetchTime = 0;
const CITY_CACHE_TTL_MS = 1000 * 60 * 60 * 1;

/**
 * @description
 * Clears the cached city names, forcing the next call to getAllCityNames to fetch fresh data
 */
export const clearCityNamesCache = (): void => {
	cachedCityNames = null;
	lastCityFetchTime = 0;
};

/**
 * @description
 * Gets list of unique city names from the database. Utilises in-memory cache to reduce database load.
 * @param force - If true, bypasses the cache and fetches fresh data
 * @returns Array of city name strings.
 */
export const getAllCityNames = async (force = false): Promise<string[]> => {
	const now = Date.now();
	if (!force && cachedCityNames && now - lastCityFetchTime < CITY_CACHE_TTL_MS) {
		return cachedCityNames;
	}

	const rows = await db.select({ city: location.city }).from(location);

	const cityNames = Array.from(new Set(rows.map((r) => r.city))).sort();

	cachedCityNames = cityNames;
	lastCityFetchTime = now;

	return cityNames;
};
