"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Phone, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { LoaderIcon } from "@/components/custom/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	EmailLoginData,
	PhoneLoginData,
	emailLoginSchema,
	phoneLoginSchema,
} from "../validation/login-schemas";

export const LoginForm = ({
	action,
	defaultEmail = "",
	errors,
}: {
	action: (formData: FormData) => void;
	defaultEmail?: string;
	errors?: {
		email?: string[];
		phone?: string[];
		password?: string[];
		general?: string[];
	};
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [loginType, setLoginType] = useState<"email" | "phone">("email");

	const emailForm = useForm<EmailLoginData>({
		resolver: zodResolver(emailLoginSchema),
		mode: "onChange",
		defaultValues: {
			email: defaultEmail,
			password: "",
			loginType: "email",
		},
	});

	const phoneForm = useForm<PhoneLoginData>({
		resolver: zodResolver(phoneLoginSchema),
		mode: "onChange",
		defaultValues: {
			phone: "",
			password: "",
			loginType: "phone",
		},
	});

	const onEmailSubmit = (data: EmailLoginData) => {
		const formData = new FormData();
		formData.append("email", data.email);
		formData.append("password", data.password);
		formData.append("loginType", data.loginType);
		action(formData);
	};

	const onPhoneSubmit = (data: PhoneLoginData) => {
		const formData = new FormData();
		formData.append("phone", data.phone);
		formData.append("password", data.password);
		formData.append("loginType", data.loginType);
		action(formData);
	};

	const getEmailErrorMessage = (field: keyof Omit<EmailLoginData, "loginType">) => {
		return emailForm.formState.errors[field]?.message || (errors?.[field] && errors[field]![0]);
	};

	const hasEmailError = (field: keyof Omit<EmailLoginData, "loginType">) => {
		return !!(emailForm.formState.errors[field] || (errors?.[field] && errors[field]!.length > 0));
	};

	const getPhoneErrorMessage = (field: keyof Omit<PhoneLoginData, "loginType">) => {
		return phoneForm.formState.errors[field]?.message || (errors?.[field] && errors[field]![0]);
	};

	const hasPhoneError = (field: keyof Omit<PhoneLoginData, "loginType">) => {
		return !!(phoneForm.formState.errors[field] || (errors?.[field] && errors[field]!.length > 0));
	};

	return (
		<Card className="mx-auto w-full max-w-md border-0 bg-card/50 shadow-2xl backdrop-blur-sm">
			<CardHeader className="space-y-1 pb-4 text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
				<CardDescription className="text-muted-foreground">
					Sign in to your account to continue
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

				{/* Tabs for login type */}
				<Tabs
					value={loginType}
					onValueChange={(value) => setLoginType(value as "email" | "phone")}
					className="w-full"
				>
					<TabsList className="mb-6 grid w-full grid-cols-2">
						<TabsTrigger value="email" className="flex items-center gap-2">
							<Mail className="size-4" />
							Email
						</TabsTrigger>
						<TabsTrigger value="phone" className="flex items-center gap-2">
							<Phone className="size-4" />
							Phone
						</TabsTrigger>
					</TabsList>

					{/* Email Login */}
					<TabsContent value="email" className="mt-0">
						<form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4" noValidate>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									{...emailForm.register("email")}
									type="email"
									placeholder="Enter your email"
									className={`h-11 border-border/50 bg-background/50 transition-colors focus:border-primary/50 ${
										hasEmailError("email") ? "border-destructive focus:border-destructive" : ""
									}`}
									autoComplete="email"
								/>
								{getEmailErrorMessage("email") && (
									<p className="text-sm text-destructive">{getEmailErrorMessage("email")}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email-password" className="text-sm font-medium">
									Password
								</Label>
								<div className="relative">
									<Input
										id="email-password"
										{...emailForm.register("password")}
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										className={`h-11 border-border/50 bg-background/50 pr-10 transition-colors focus:border-primary/50 ${
											hasEmailError("password") ? "border-destructive focus:border-destructive" : ""
										}`}
										autoComplete="current-password"
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
								{getEmailErrorMessage("password") && (
									<p className="text-sm text-destructive">{getEmailErrorMessage("password")}</p>
								)}
							</div>

							<div className="pt-2">
								<Button
									type="submit"
									disabled={emailForm.formState.isSubmitting}
									className="h-11 w-full rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
								>
									{emailForm.formState.isSubmitting ? (
										<div className="flex items-center gap-2">
											<LoaderIcon size={16} />
											Signing In...
										</div>
									) : (
										"Sign In"
									)}
								</Button>
							</div>
						</form>
					</TabsContent>

					{/* Phone Login */}
					<TabsContent value="phone" className="mt-0">
						<form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4" noValidate>
							<div className="space-y-2">
								<Label htmlFor="phone" className="text-sm font-medium">
									Phone Number
								</Label>
								<Input
									id="phone"
									{...phoneForm.register("phone")}
									type="tel"
									placeholder="Enter your phone number"
									className={`h-11 border-border/50 bg-background/50 transition-colors focus:border-primary/50 ${
										hasPhoneError("phone") ? "border-destructive focus:border-destructive" : ""
									}`}
									autoComplete="tel"
								/>
								{getPhoneErrorMessage("phone") && (
									<p className="text-sm text-destructive">{getPhoneErrorMessage("phone")}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone-password" className="text-sm font-medium">
									Password
								</Label>
								<div className="relative">
									<Input
										id="phone-password"
										{...phoneForm.register("password")}
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										className={`h-11 border-border/50 bg-background/50 pr-10 transition-colors focus:border-primary/50 ${
											hasPhoneError("password") ? "border-destructive focus:border-destructive" : ""
										}`}
										autoComplete="current-password"
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
								{getPhoneErrorMessage("password") && (
									<p className="text-sm text-destructive">{getPhoneErrorMessage("password")}</p>
								)}
							</div>

							<div className="pt-2">
								<Button
									type="submit"
									disabled={phoneForm.formState.isSubmitting}
									className="h-11 w-full rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
								>
									{phoneForm.formState.isSubmitting ? (
										<div className="flex items-center gap-2">
											<LoaderIcon size={16} />
											Signing In...
										</div>
									) : (
										"Sign In"
									)}
								</Button>
							</div>
						</form>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};
