"use server";

import {
	ServiceProviderFormData,
	ServiceProviderFormSchema,
} from "@/app/(dashboard)/admin/service-providers/validations";
import {
	validatePersistentLink,
	incrementLinkUsage,
} from "@/db/queries/persistentRegistrationLink.queries";
import { markTokenAsUsed, validateToken } from "@/db/queries/registrationToken.queries";
import { createServiceProvider } from "@/db/queries/serviceProvider.queries";

export const registerPartner = async (formData: ServiceProviderFormData) => {
	try {
		const validatedFields = ServiceProviderFormSchema.safeParse(formData);

		if (!validatedFields.success) {
			return {
				success: false,
				error: validatedFields.error.flatten().fieldErrors,
			};
		}

		if (validatedFields.data.token) {
			const tokenValidation = await validateToken(validatedFields.data.token);

			if (!tokenValidation.isValid) {
				return {
					success: false,
					error: tokenValidation.reason || "Invalid registration token",
				};
			}
		} else if (validatedFields.data.persistentLinkId) {
			const linkValidation = await validatePersistentLink(validatedFields.data.persistentLinkId);

			if (!linkValidation.isValid) {
				return {
					success: false,
					error: linkValidation.reason || "Invalid registration link",
				};
			}
		}

		const serviceLocations = validatedFields.data.serviceLocations;
		const normalizedServiceTypes = validatedFields.data.serviceType.filter((type) => {
			return type !== "other";
		});

		const dataToInsert = {
			name: validatedFields.data.name,
			email: validatedFields.data.email,
			phone: validatedFields.data.phone,
			locationId: null, // FIXME: Remove locationId and locationIds(deprecated)
			locationIds: null,
			serviceLocations: serviceLocations,
			serviceType: normalizedServiceTypes,
			areaCovered:
				validatedFields.data.areaCovered && validatedFields.data.areaCovered.length > 0
					? validatedFields.data.areaCovered
					: ["all"],
			status: "pending",
			role: "partner",
			reputation: 0,
			responseTime: 0,
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

		if (validatedFields.data.token) {
			await markTokenAsUsed(validatedFields.data.token);
		} else if (validatedFields.data.persistentLinkId) {
			await incrementLinkUsage(validatedFields.data.persistentLinkId);
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error registering partner:", error);
		return {
			success: false,
			error: "Failed to register. Please try again later.",
		};
	}
};
