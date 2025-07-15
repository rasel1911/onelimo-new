import { z } from "zod";

export const emailLoginSchema = z.object({
	email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
	loginType: z.literal("email"),
});

export const phoneLoginSchema = z.object({
	phone: z
		.string()
		.min(1, "Phone number is required")
		.min(10, "Phone number must be at least 10 digits")
		.regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
	loginType: z.literal("phone"),
});

export type EmailLoginData = z.infer<typeof emailLoginSchema>;
export type PhoneLoginData = z.infer<typeof phoneLoginSchema>;
