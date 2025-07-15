"use server";

import { z } from "zod";

import { fetchLocations } from "@/app/(dashboard)/admin/locations/actions";
import { markTokenAsUsed, validateToken } from "@/db/queries/registrationToken.queries";
import { createServiceProvider } from "@/db/queries/serviceProvider.queries";

const SERVICE_TYPES = [
	"suv",
	"party_bus",
	"stretch_limousine",
	"sedan",
	"hummer",
	"other",
	"not_specified",
] as const;

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
	locationId: z.string().min(1, "Location is required"),
	serviceType: z.array(z.string()).min(1, "At least one service type is required"),
	areaCovered: z.array(z.string()).optional(),
	token: z.string().nullable().optional(), // The registration token
});

export type PartnerRegistrationFormData = z.infer<typeof PartnerRegistrationSchema>;

export async function registerPartner(formData: PartnerRegistrationFormData) {
	try {
		// Validate form data
		const validatedFields = PartnerRegistrationSchema.safeParse(formData);

		if (!validatedFields.success) {
			return {
				success: false,
				error: validatedFields.error.flatten().fieldErrors,
			};
		}

		// Validate token if provided
		if (validatedFields.data.token) {
			const tokenValidation = await validateToken(validatedFields.data.token);

			if (!tokenValidation.isValid) {
				return {
					success: false,
					error: tokenValidation.reason || "Invalid registration token",
				};
			}
		}

		const locationId = validatedFields.data.locationId;

		const normalizedServiceTypes = validatedFields.data.serviceType.map((type) => {
			if (SERVICE_TYPES.includes(type as any)) {
				return type;
			}
			// For custom service types, use "other" as the enum value
			return "other";
		});

		const dataToInsert = {
			name: validatedFields.data.name,
			email: validatedFields.data.email,
			phone: validatedFields.data.phone,
			locationId: locationId,
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
}
