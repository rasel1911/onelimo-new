"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
	createLocation as createLocationQuery,
	getAllLocations,
	getLocationById,
	updateLocation,
	deleteLocation,
	clearCityNamesCache,
} from "@/db/queries/location.queries";

const LocationSchema = z.object({
	city: z.string().min(1, "City is required"),
	zipcodes: z.array(z.string()).min(1, "At least one zipcode is required"),
});

export type LocationFormData = z.infer<typeof LocationSchema>;

/**
 * Create a new location
 * @param formData - The form data to create the location with
 * @returns The result of the create operation
 */
export const createLocation = async (formData: FormData) => {
	const city = formData.get("city")?.toString();
	const zipcodes = formData.getAll("zipcodes").map((zip) => zip.toString());

	const validatedFields = LocationSchema.safeParse({
		city,
		zipcodes,
	});

	if (!validatedFields.success) {
		return {
			success: false,
			error: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		const newLocation = await createLocationQuery({
			city: validatedFields.data.city,
			zipcodes: validatedFields.data.zipcodes,
		});

		clearCityNamesCache();

		revalidatePath("/admin/locations");
		revalidatePath("/admin/service-providers");

		return {
			success: true,
			location: {
				id: newLocation.id,
				city: newLocation.city,
			},
		};
	} catch (error) {
		console.error("Failed to create location:", error);
		return {
			success: false,
			error: "Failed to create location. Please try again.",
		};
	}
};

/**
 * Fetch all locations
 * @returns The result of the fetch operation
 */
export const fetchLocations = async () => {
	try {
		const locations = await getAllLocations();
		return { success: true, locations };
	} catch (error) {
		console.error("Failed to fetch locations:", error);
		return {
			success: false,
			error: "Failed to fetch locations. Please try again.",
		};
	}
};

/**
 * Fetch a location by its ID
 * @param id - The ID of the location to fetch
 * @returns The result of the fetch operation
 */
export const fetchLocationById = async (id: string) => {
	try {
		const location = await getLocationById(id);
		if (!location) {
			return {
				success: false,
				error: "Location not found.",
			};
		}
		return { success: true, location };
	} catch (error) {
		console.error("Failed to fetch location:", error);
		return {
			success: false,
			error: "Failed to fetch location. Please try again.",
		};
	}
};

/**
 * Update a location by its ID
 * @param id - The ID of the location to update
 * @param formData - The form data to update the location with
 * @returns The result of the update operation
 */
export const updateLocationAction = async (id: string, formData: FormData) => {
	const city = formData.get("city")?.toString();
	const zipcodes = formData.getAll("zipcodes").map((zip) => zip.toString());

	const validatedFields = LocationSchema.safeParse({
		city,
		zipcodes,
	});

	if (!validatedFields.success) {
		return {
			success: false,
			error: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		await updateLocation(id, {
			city: validatedFields.data.city,
			zipcodes: validatedFields.data.zipcodes,
		});

		clearCityNamesCache();

		revalidatePath("/admin/locations");
		revalidatePath("/admin/service-providers");

		return { success: true };
	} catch (error) {
		console.error("Failed to update location:", error);
		return {
			success: false,
			error: "Failed to update location. Please try again.",
		};
	}
};

/**
 * Delete a location by its ID
 * @param id - The ID of the location to delete
 * @returns The result of the delete operation
 */
export const deleteLocationAction = async (id: string) => {
	try {
		await deleteLocation(id);

		clearCityNamesCache();

		revalidatePath("/admin/locations");
		revalidatePath("/admin/service-providers");
		return { success: true };
	} catch (error) {
		console.error("Failed to delete location:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to delete location. Please try again.",
		};
	}
};
