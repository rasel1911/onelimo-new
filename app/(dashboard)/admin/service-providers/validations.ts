import { z } from "zod";

export const SERVICE_TYPES = [
	{ value: "suv", label: "SUV Service" },
	{ value: "party_bus", label: "Party Bus" },
	{ value: "stretch_limousine", label: "Stretch Limousine" },
	{ value: "sedan", label: "Sedan Service" },
	{ value: "hummer", label: "Hummer" },
	{ value: "other", label: "Other Service" },
] as const;

export const SERVICE_TYPE_VALUES = SERVICE_TYPES.map((type) => type.value);

export const ROLES = ["user", "customer", "admin", "support", "partner"] as const;

export const STATUS_OPTIONS = ["active", "inactive", "pending"] as const;

export const REPUTATION_OPTIONS = [
	{ value: 0, label: "Default (0)" },
	{ value: 1, label: "Good (1)" },
	{ value: 2, label: "Very Good (2)" },
	{ value: 3, label: "Excellent (3)" },
	{ value: 4, label: "Outstanding (4)" },
	{ value: 5, label: "Exceptional (5)" },
] as const;

export const RESPONSE_TIME_OPTIONS = [
	{ value: 0, label: "Default (0)" },
	{ value: 1, label: "Fast (1)" },
	{ value: 2, label: "Very Fast (2)" },
	{ value: 3, label: "Excellent (3)" },
	{ value: 4, label: "Outstanding (4)" },
	{ value: 5, label: "Exceptional (5)" },
] as const;

/**
 * Common validation rules for service provider forms
 */
export const serviceProviderSchema = {
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
				const euRegex = /^(\+[1-9]{1}[0-9]{1,2}|00[1-9]{1}[0-9]{1,2})[0-9]{6,12}$/;
				const ukRegex = /^(\+44|0)7\d{9}$/;
				return euRegex.test(phone.replace(/\s+/g, "")) || ukRegex.test(phone.replace(/\s+/g, ""));
			},
			{ message: "Please enter a valid EU or UK phone number" },
		),

	serviceType: z.array(z.string()).min(1, "At least one service type is required"),
	serviceLocations: z.array(z.string()).min(1, "At least one service location is required"),
	areaCovered: z.array(z.string()).optional(),

	status: z.enum(STATUS_OPTIONS),
	role: z.enum(ROLES),
	reputation: z.coerce.number().min(0).max(5),
	responseTime: z.coerce.number().min(0).max(5),
	website: z.string().optional(),

	token: z.string().nullable().optional(),
	persistentLinkId: z.string().nullable().optional(),
};

/**
 * Service provider schema for form validation
 */
export const ServiceProviderFormSchema = z.object({
	name: serviceProviderSchema.name,
	email: serviceProviderSchema.email,
	phone: serviceProviderSchema.phone,
	status: serviceProviderSchema.status,
	role: serviceProviderSchema.role,
	serviceLocations: serviceProviderSchema.serviceLocations,
	areaCovered: serviceProviderSchema.areaCovered,
	serviceType: serviceProviderSchema.serviceType,
	reputation: serviceProviderSchema.reputation,
	responseTime: serviceProviderSchema.responseTime,
	website: serviceProviderSchema.website,
	token: serviceProviderSchema.token.optional(),
	persistentLinkId: serviceProviderSchema.persistentLinkId.optional(),
});

/**
 * Registration form schema - extends the main schema
 */
export const registrationFormSchema = ServiceProviderFormSchema.pick({
	name: true,
	email: true,
	phone: true,
	serviceLocations: true,
	serviceType: true,
	website: true,
});

export type ServiceProviderFormData = z.infer<typeof ServiceProviderFormSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
