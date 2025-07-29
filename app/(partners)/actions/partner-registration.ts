"use server";

import { z } from "zod";

import {
	validatePersistentLink,
	incrementLinkUsage,
} from "@/db/queries/persistentRegistrationLink.queries";
import { markTokenAsUsed, validateToken } from "@/db/queries/registrationToken.queries";
import { createServiceProvider } from "@/db/queries/serviceProvider.queries";

const PartnerRegistrationSchema = z.object({
	name: z
		.string()
		.min(1, "Company name is required")
		.max(100, "Company name must be less than 100 characters"),
	email: z
		.string()
		.email("Invalid email address")
		.refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
			message: "Please enter a valid email address",
		}),
	phone: z
		.string()
		.min(1, "Phone number is required")
		.refine(
			(phone) => {
				// EU phone number format (with country code)
				const euRegex = /^(\+[1-9]{1}[0-9]{1,2}|00[1-9]{1}[0-9]{1,2})[0-9]{6,12}$/;
				// UK phone number formats
				const ukRegex = /^(\+44|0)7\d{9}$/;

				return euRegex.test(phone.replace(/\s+/g, "")) || ukRegex.test(phone.replace(/\s+/g, ""));
			},
			{ message: "Please enter a valid EU or UK phone number" },
		),
	locationIds: z.array(z.string()).min(1, "At least one location is required"),
	serviceType: z.array(z.string()).min(1, "At least one service type is required"),
	areaCovered: z.array(z.string()).optional(),
	token: z.string().nullable().optional(),
	persistentLinkId: z.string().nullable().optional(),
});

export type PartnerRegistrationFormData = z.infer<typeof PartnerRegistrationSchema>;

export const registerPartner = async (formData: PartnerRegistrationFormData) => {
	try {
		const validatedFields = PartnerRegistrationSchema.safeParse(formData);

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

		const locationIds = validatedFields.data.locationIds;

		const normalizedServiceTypes = validatedFields.data.serviceType.filter((type) => {
			return type !== "other";
		});

		const dataToInsert = {
			name: validatedFields.data.name,
			email: validatedFields.data.email,
			phone: validatedFields.data.phone,
			locationId: locationIds[0], // For backward compatibility, deprecated
			locationIds: locationIds,
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
