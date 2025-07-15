import { z } from "zod";

export const signupSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters"),
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address")
		.max(64, "Email must be less than 64 characters"),
	phone: z
		.string()
		.min(1, "Phone number is required")
		.min(10, "Phone number must be at least 10 digits")
		.max(20, "Phone number must be less than 20 characters")
		.regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters")
		.max(64, "Password must be less than 64 characters")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/\d/, "Password must contain at least one number"),
});

export type SignupFormData = z.infer<typeof signupSchema>;
