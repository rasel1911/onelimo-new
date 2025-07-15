"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HelpCircle, User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SignupFormData, signupSchema } from "@/app/(auth)/validation/signup-schema";
import { LoaderIcon } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SignupForm({
	action,
	defaultEmail = "",
	errors,
}: {
	action: (formData: FormData) => void;
	defaultEmail?: string;
	errors?: {
		name?: string[];
		email?: string[];
		phone?: string[];
		password?: string[];
		general?: string[];
	};
}) {
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors: formErrors, isSubmitting, isValid },
		watch,
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			email: defaultEmail,
			phone: "",
			password: "",
		},
	});

	// Watch password to show real-time validation hints
	const password = watch("password");
	const hasLower = /[a-z]/.test(password);
	const hasUpper = /[A-Z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasMinLength = password.length >= 6;

	const onSubmit = (data: SignupFormData) => {
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("email", data.email);
		formData.append("phone", data.phone);
		formData.append("password", data.password);
		action(formData);
	};

	const getErrorMessage = (field: keyof SignupFormData) => {
		return formErrors[field]?.message || (errors?.[field] && errors[field]![0]);
	};

	const hasError = (field: keyof SignupFormData) => {
		return !!(formErrors[field] || (errors?.[field] && errors[field]!.length > 0));
	};

	return (
		<TooltipProvider>
			<Card className="mx-auto w-full max-w-md border-0 bg-card/50 shadow-2xl backdrop-blur-sm">
				<CardHeader className="space-y-1 pb-4 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
					<CardDescription className="text-muted-foreground">
						Enter your information to create your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Display general errors */}
					{errors?.general && errors.general.length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertDescription>{errors.general[0]}</AlertDescription>
						</Alert>
					)}

					{/* Signup Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
						<div className="space-y-2">
							<Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
								<User className="size-4" />
								Full Name
							</Label>
							<Input
								id="name"
								{...register("name")}
								type="text"
								placeholder="Enter your full name"
								className={`h-11 border-border bg-input/20 transition-colors focus:border-primary ${
									hasError("name") ? "border-destructive focus:border-destructive" : ""
								}`}
								autoComplete="name"
							/>
							{getErrorMessage("name") && (
								<p className="text-sm text-destructive">{getErrorMessage("name")}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
								<Mail className="size-4" />
								Email Address
							</Label>
							<Input
								id="email"
								{...register("email")}
								type="email"
								placeholder="Enter your email address"
								className={`h-11 border-border bg-input/20 transition-colors focus:border-primary ${
									hasError("email") ? "border-destructive focus:border-destructive" : ""
								}`}
								autoComplete="email"
							/>
							{getErrorMessage("email") && (
								<p className="text-sm text-destructive">{getErrorMessage("email")}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
								<Phone className="size-4" />
								Phone Number
								<Tooltip>
									<TooltipTrigger asChild>
										<HelpCircle className="size-4 cursor-help text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent side="right" className="max-w-xs">
										<div className="space-y-2">
											<p className="font-medium">Why do we need your phone number?</p>
											<ul className="space-y-1 text-sm">
												<li>• Account security and verification</li>
												<li>• Important booking notifications</li>
												<li>• Emergency contact for services</li>
											</ul>
										</div>
									</TooltipContent>
								</Tooltip>
							</Label>
							<Input
								id="phone"
								{...register("phone")}
								type="tel"
								placeholder="Enter your phone number"
								className={`h-11 border-border bg-input/20 transition-colors focus:border-primary ${
									hasError("phone") ? "border-destructive focus:border-destructive" : ""
								}`}
								autoComplete="tel"
							/>
							{getErrorMessage("phone") && (
								<p className="text-sm text-destructive">{getErrorMessage("phone")}</p>
							)}
							{!getErrorMessage("phone") && (
								<p className="text-xs text-muted-foreground">
									Used for account verification and booking notifications
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
								<Lock className="size-4" />
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									{...register("password")}
									type={showPassword ? "text" : "password"}
									placeholder="Create a strong password"
									className={`h-11 border-border bg-input/20 pr-10 transition-colors focus:border-primary ${
										hasError("password") ? "border-destructive focus:border-destructive" : ""
									}`}
									autoComplete="new-password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="size-4 text-muted-foreground" />
									) : (
										<Eye className="size-4 text-muted-foreground" />
									)}
								</Button>
							</div>
							{getErrorMessage("password") && (
								<p className="text-sm text-destructive">{getErrorMessage("password")}</p>
							)}
							{!getErrorMessage("password") && password && (
								<div className="space-y-1 text-xs">
									<div className="flex items-center gap-2">
										<div
											className={`size-2 rounded-full ${
												hasMinLength ? "bg-green-500" : "bg-gray-300"
											}`}
										/>
										<span className={hasMinLength ? "text-green-600" : "text-muted-foreground"}>
											At least 6 characters
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={`size-2 rounded-full ${hasUpper ? "bg-green-500" : "bg-gray-300"}`}
										/>
										<span className={hasUpper ? "text-green-600" : "text-muted-foreground"}>
											One uppercase letter
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={`size-2 rounded-full ${hasLower ? "bg-green-500" : "bg-gray-300"}`}
										/>
										<span className={hasLower ? "text-green-600" : "text-muted-foreground"}>
											One lowercase letter
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={`size-2 rounded-full ${
												hasNumber ? "bg-green-500" : "bg-gray-300"
											}`}
										/>
										<span className={hasNumber ? "text-green-600" : "text-muted-foreground"}>
											One number
										</span>
									</div>
								</div>
							)}
							{!getErrorMessage("password") && !password && (
								<p className="text-xs text-muted-foreground">
									Must contain uppercase, lowercase, and number (6+ characters)
								</p>
							)}
						</div>

						<div className="pt-2">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="h-11 w-full rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
							>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<LoaderIcon size={16} />
										Creating Account...
									</div>
								) : (
									"Create Account"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
