"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { PinSetup } from "../components/pin-setup";

interface ResetTokenValidation {
	valid: boolean;
	provider?: {
		id: string;
		name: string;
		email: string;
	};
	error?: string;
	expired?: boolean;
}

const ResetPinContent = () => {
	const [tokenValidation, setTokenValidation] = useState<ResetTokenValidation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [resetError, setResetError] = useState<string>("");
	const [resetSuccess, setResetSuccess] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			setTokenValidation({ valid: false, error: "Invalid reset link" });
			setIsLoading(false);
			return;
		}

		validateResetToken(token);
	}, [token]);

	const validateResetToken = async (resetToken: string) => {
		try {
			const response = await fetch("/provider-auth/api/validate-reset-token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: resetToken }),
			});

			const data = await response.json();

			if (data.success) {
				setTokenValidation({
					valid: true,
					provider: data.provider,
				});
			} else {
				setTokenValidation({
					valid: false,
					error: data.error || "Invalid or expired reset link",
					expired: data.expired,
				});
			}
		} catch (error) {
			console.error("Token validation error:", error);
			setTokenValidation({
				valid: false,
				error: "Failed to validate reset link",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handlePinReset = async (pin: string, confirmPin: string) => {
		if (!token || !tokenValidation?.provider) {
			return { success: false, error: "Invalid reset session" };
		}

		try {
			const response = await fetch("/provider-auth/api/reset-pin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token,
					providerId: tokenValidation.provider.id,
					pin,
					confirmPin,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setResetSuccess(true);
				setTimeout(() => {
					router.push("/bq");
				}, 3000);
				return { success: true };
			} else {
				setResetError(data.error || "Failed to reset PIN");
				return { success: false, error: data.error };
			}
		} catch (error) {
			console.error("PIN reset error:", error);
			const errorMessage = "Failed to reset PIN. Please try again.";
			setResetError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="text-center">
					<div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					<p className="text-muted-foreground">Validating reset link...</p>
				</div>
			</div>
		);
	}

	if (!tokenValidation?.valid) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="size-8 text-destructive" />
						</div>
						<h1 className="text-2xl font-bold text-foreground">Invalid Reset Link</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							{tokenValidation?.expired
								? "This reset link has expired. Please request a new one."
								: "This reset link is invalid or has already been used."}
						</p>
					</div>

					<Alert variant="destructive">
						<AlertTriangle className="size-4" />
						<AlertDescription>
							{tokenValidation?.error || "Unable to reset PIN with this link"}
						</AlertDescription>
					</Alert>

					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Please request a new PIN reset from your provider dashboard or contact support.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (resetSuccess) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
							<CheckCircle className="size-8 text-green-600" />
						</div>
						<h1 className="text-2xl font-bold text-foreground">PIN Reset Successful</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Your PIN has been successfully reset. You will be redirected to the booking page
							shortly.
						</p>
					</div>

					<Alert>
						<CheckCircle className="size-4" />
						<AlertDescription>
							Your account has been unblocked and you can now access your booking requests with your
							new PIN.
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	return (
		<PinSetup
			onPinSetupAction={handlePinReset}
			error={resetError}
			providerName={tokenValidation.provider?.name}
		/>
	);
};

const LoadingFallback = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="text-center">
				<div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
				<p className="text-muted-foreground">Loading PIN reset...</p>
			</div>
		</div>
	);
};

const ResetPinPage = () => {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ResetPinContent />
		</Suspense>
	);
};

export default ResetPinPage;
