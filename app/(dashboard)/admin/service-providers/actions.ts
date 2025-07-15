"use server";

import { revalidatePath } from "next/cache";

import {
	createServiceProvider,
	updateServiceProvider,
	deleteServiceProvider,
	getAllServiceProviders,
} from "@/db/queries/serviceProvider.queries";

import { SERVICE_TYPES, ServiceProviderSchema } from "./validations";

/**
 * Create a new service provider
 * @param formData - The form data to create the service provider with
 * @returns The result of the create operation
 */
export const createServiceProviderAction = async (formData: FormData) => {
	const rawData = Object.fromEntries(formData.entries());

	const areaCovered = formData.getAll("areaCovered").map((area) => area.toString());
	const serviceType = formData.getAll("serviceType").map((type) => type.toString());

	if (serviceType.length === 0) {
		return {
			success: false,
			errors: {
				serviceType: ["At least one service type is required"],
			},
		};
	}

	const reputation = parseInt(formData.get("reputation")?.toString() || "0");
	const responseTime = parseInt(formData.get("responseTime")?.toString() || "0");

	const validatedFields = ServiceProviderSchema.safeParse({
		...rawData,
		areaCovered,
		serviceType,
		reputation,
		responseTime,
	});

	if (!validatedFields.success) {
		return {
			success: false,
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		const existingProviders = await getAllServiceProviders();

		const emailExists = existingProviders.some(
			(provider) => provider.email.toLowerCase() === validatedFields.data.email.toLowerCase(),
		);

		if (emailExists) {
			return {
				success: false,
				errors: {
					email: ["A service provider with this email already exists."],
				},
			};
		}

		const phoneExists = existingProviders.some(
			(provider) => provider.phone === validatedFields.data.phone,
		);

		if (phoneExists) {
			return {
				success: false,
				errors: {
					phone: ["A service provider with this phone number already exists."],
				},
			};
		}

		const normalizedServiceTypes = validatedFields.data.serviceType.map((type) => {
			if (SERVICE_TYPES.includes(type as any)) {
				return type;
			}
			return "not_specified";
		});

		const dataToInsert = {
			...validatedFields.data,
			locationId: validatedFields.data.locationId,
			areaCovered:
				validatedFields.data.areaCovered && validatedFields.data.areaCovered.length > 0
					? validatedFields.data.areaCovered
					: ["all"],
			serviceType: normalizedServiceTypes,
			reputation: validatedFields.data.reputation || 0,
			responseTime: validatedFields.data.responseTime || 0,
			role: validatedFields.data.role || "user",
			status: validatedFields.data.status || "pending",
		};

		await createServiceProvider({
			...dataToInsert,
			pinHash: null,
			pinSalt: null,
			pinSetAt: null,
			failedPinAttempts: 0,
			lastFailedPinAttempt: null,
			isBlocked: "false",
			blockedAt: null,
			pinResetToken: null,
			pinResetTokenExpiresAt: null,
			pinResetRequestedAt: null,
		});
		revalidatePath("/admin/service-providers");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error creating service provider:", error);
		return {
			success: false,
			errors: {
				server: ["Failed to create service provider. Please try again."],
			},
		};
	}
};

/**
 * Update a service provider by their ID
 * @param id - The ID of the service provider to update
 * @param formData - The form data to update the service provider with
 * @returns The result of the update operation
 */
export const updateServiceProviderAction = async (id: string, formData: FormData) => {
	const rawData = Object.fromEntries(formData.entries());

	const areaCovered = formData.getAll("areaCovered").map((area) => area.toString());
	const serviceType = formData.getAll("serviceType").map((type) => type.toString());

	if (serviceType.length === 0) {
		return {
			success: false,
			errors: {
				serviceType: ["At least one service type is required"],
			},
		};
	}

	const reputation = parseInt(formData.get("reputation")?.toString() || "0");
	const responseTime = parseInt(formData.get("responseTime")?.toString() || "0");

	const validatedFields = ServiceProviderSchema.safeParse({
		...rawData,
		areaCovered,
		serviceType,
		reputation,
		responseTime,
	});

	if (!validatedFields.success) {
		return {
			success: false,
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		const existingProviders = await getAllServiceProviders();

		const emailExists = existingProviders.some(
			(provider) =>
				provider.id !== id &&
				provider.email.toLowerCase() === validatedFields.data.email.toLowerCase(),
		);

		if (emailExists) {
			return {
				success: false,
				errors: {
					email: ["A service provider with this email already exists."],
				},
			};
		}

		const phoneExists = existingProviders.some(
			(provider) => provider.id !== id && provider.phone === validatedFields.data.phone,
		);

		if (phoneExists) {
			return {
				success: false,
				errors: {
					phone: ["A service provider with this phone number already exists."],
				},
			};
		}

		const normalizedServiceTypes = validatedFields.data.serviceType.map((type) => {
			if (SERVICE_TYPES.includes(type as any)) {
				return type;
			}
			return "not_specified";
		});

		const dataToUpdate = {
			...validatedFields.data,
			locationId: validatedFields.data.locationId,
			areaCovered:
				validatedFields.data.areaCovered && validatedFields.data.areaCovered.length > 0
					? validatedFields.data.areaCovered
					: ["all"],
			serviceType: normalizedServiceTypes,
			reputation: validatedFields.data.reputation || 0,
			responseTime: validatedFields.data.responseTime || 0,
			role: validatedFields.data.role || "user",
		};

		await updateServiceProvider(id, dataToUpdate);
		revalidatePath("/admin/service-providers");

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error updating service provider:", error);
		return {
			success: false,
			errors: {
				server: ["Failed to update service provider. Please try again."],
			},
		};
	}
};

/**
 * Delete a service provider by their ID
 * @param id - The ID of the service provider to delete
 * @returns The result of the delete operation
 */
export const deleteServiceProviderAction = async (id: string) => {
	try {
		await deleteServiceProvider(id);
		revalidatePath("/admin/service-providers");
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: "Failed to delete service provider. Please try again.",
		};
	}
};
