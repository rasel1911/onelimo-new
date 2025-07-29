import { z } from "zod";

export const ROLES = ["user", "customer", "admin", "support", "partner"] as const;

export const ServiceProviderSchema = z.object({
	name: z.string().min(1, "Name is required"),
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
	status: z.enum(["active", "inactive", "pending"]).default("pending"),
	role: z.enum(ROLES).default("user"),
	locationIds: z.array(z.string()).min(1, "At least one service location is required"),
	areaCovered: z.array(z.string()).optional(),
	serviceType: z.array(z.string()).min(1, "At least one service type is required"),
	reputation: z.coerce.number().min(0).max(5).default(0),
	responseTime: z.coerce.number().min(0).max(5).default(0),
});

export type ServiceProviderFormData = z.infer<typeof ServiceProviderSchema>;
