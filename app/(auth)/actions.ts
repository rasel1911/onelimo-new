"use server";

import { z } from "zod";

import { createUser, getUser, getUserByPhone } from "@/db/queries";

import { signIn } from "./auth";

const loginFormSchema = z
	.object({
		email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
		phone: z
			.string()
			.min(10, "Phone number must be at least 10 digits")
			.max(20, "Phone number must be less than 20 characters")
			.regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
			.optional()
			.or(z.literal("")),
		password: z.string().min(6, "Password must be at least 6 characters"),
		loginType: z.enum(["email", "phone"]),
	})
	.refine(
		(data) => {
			if (data.loginType === "email" && (!data.email || data.email === "")) {
				return false;
			}
			if (data.loginType === "phone" && (!data.phone || data.phone === "")) {
				return false;
			}
			return true;
		},
		{
			message: "Email is required for email login, phone is required for phone login",
			path: ["loginType"],
		},
	);

const registerFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters"),
	email: z
		.string()
		.email("Please enter a valid email address")
		.max(64, "Email must be less than 64 characters"),
	phone: z
		.string()
		.min(10, "Phone number must be at least 10 digits")
		.max(20, "Phone number must be less than 20 characters")
		.regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(64, "Password must be less than 64 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		),
});

export interface LoginActionState {
	status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
	errors?: {
		email?: string[];
		phone?: string[];
		password?: string[];
		general?: string[];
	};
}

export const login = async (_: LoginActionState, formData: FormData): Promise<LoginActionState> => {
	try {
		const validatedData = loginFormSchema.parse({
			email: formData.get("email") || undefined,
			phone: formData.get("phone") || undefined,
			password: formData.get("password"),
			loginType: formData.get("loginType"),
		});

		console.log("Login attempt:", {
			loginType: validatedData.loginType,
			email: validatedData.email,
			phone: validatedData.phone,
			hasPassword: !!validatedData.password,
		});

		try {
			const result = await signIn("credentials", {
				email: validatedData.email,
				phone: validatedData.phone,
				password: validatedData.password,
				loginType: validatedData.loginType,
				redirect: false,
			});

			if (result?.error) {
				return {
					status: "failed",
					errors: {
						general: ["Invalid credentials. Please check your login details and try again."],
					},
				};
			}

			return { status: "success" };
		} catch (authError: any) {
			if (
				authError?.type === "CredentialsSignin" ||
				authError?.message?.includes("CredentialsSignin")
			) {
				return {
					status: "failed",
					errors: {
						general: ["Invalid credentials. Please check your login details and try again."],
					},
				};
			}

			console.error("Authentication error:", authError);
			return {
				status: "failed",
				errors: {
					general: ["Authentication failed. Please try again."],
				},
			};
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			const fieldErrors: any = {};
			error.errors.forEach((err) => {
				if (err.path) {
					const field = err.path[0] as string;
					if (!fieldErrors[field]) {
						fieldErrors[field] = [];
					}
					fieldErrors[field].push(err.message);
				}
			});

			return {
				status: "invalid_data",
				errors: fieldErrors,
			};
		}

		console.error("Login error:", error);
		return {
			status: "failed",
			errors: {
				general: ["An unexpected error occurred. Please try again."],
			},
		};
	}
};

export interface RegisterActionState {
	status: "idle" | "in_progress" | "success" | "failed" | "user_exists" | "invalid_data";
	errors?: {
		name?: string[];
		email?: string[];
		phone?: string[];
		password?: string[];
		general?: string[];
	};
}

export const register = async (
	_: RegisterActionState,
	formData: FormData,
): Promise<RegisterActionState> => {
	try {
		const validatedData = registerFormSchema.parse({
			name: formData.get("name"),
			email: formData.get("email"),
			phone: formData.get("phone"),
			password: formData.get("password"),
		});

		let [existingUserByEmail] = await getUser(validatedData.email);
		if (existingUserByEmail) {
			return {
				status: "user_exists",
				errors: {
					email: ["An account with this email already exists"],
				},
			};
		}

		// Check if user already exists by phone
		let [existingUserByPhone] = await getUserByPhone(validatedData.phone);
		if (existingUserByPhone) {
			return {
				status: "user_exists",
				errors: {
					phone: ["An account with this phone number already exists"],
				},
			};
		}

		// Create new user
		await createUser(
			validatedData.email,
			validatedData.password,
			validatedData.name,
			validatedData.phone,
		);

		// Automatically sign in the new user
		const result = await signIn("credentials", {
			email: validatedData.email,
			password: validatedData.password,
			loginType: "email",
			redirect: false,
		});

		if (result?.error) {
			return {
				status: "failed",
				errors: {
					general: ["Account created but failed to sign in. Please try logging in manually."],
				},
			};
		}

		return { status: "success" };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const fieldErrors: any = {};
			error.errors.forEach((err) => {
				if (err.path) {
					const field = err.path[0] as string;
					if (!fieldErrors[field]) {
						fieldErrors[field] = [];
					}
					fieldErrors[field].push(err.message);
				}
			});

			return {
				status: "invalid_data",
				errors: fieldErrors,
			};
		}

		console.error("Registration error:", error);
		return {
			status: "failed",
			errors: {
				general: ["An unexpected error occurred. Please try again."],
			},
		};
	}
};
