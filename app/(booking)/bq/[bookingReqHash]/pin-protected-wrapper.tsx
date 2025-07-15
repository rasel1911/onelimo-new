"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { BlockedAccount } from "@/app/(auth)/provider-auth/components/blocked-account";
import { PinEntry } from "@/app/(auth)/provider-auth/components/pin-entry";
import { PinSetup } from "@/app/(auth)/provider-auth/components/pin-setup";
import { usePinAuth } from "@/hooks/use-pin-auth";
import { useToast } from "@/hooks/use-toast";

interface PinProtectedWrapperProps {
	children: React.ReactNode;
	providerId: string;
	providerName?: string;
}

interface ProviderStatus {
	needsSetup: boolean;
	isBlocked: boolean;
	name: string;
	email: string;
	failedAttempts: number;
	blockedAt?: Date;
}

export function PinProtectedWrapper({ children, providerId }: PinProtectedWrapperProps) {
	const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
	const [isProviderLoading, setIsProviderLoading] = useState(true);
	const [isRequestingReset, setIsRequestingReset] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const pinAuth = usePinAuth();

	const isAuthenticatedForProvider = pinAuth.isAuthenticated && pinAuth.providerId === providerId;

	const checkProviderStatus = useCallback(async () => {
		try {
			const response = await fetch(`/provider-auth/api/provider-status/${providerId}`);
			const data = await response.json();

			if (data.success) {
				setProviderStatus({
					needsSetup: !data.provider.pinSetAt,
					isBlocked: data.provider.isBlocked === "true",
					name: data.provider.name,
					email: data.provider.email,
					failedAttempts: data.provider.failedPinAttempts || 0,
					blockedAt: data.provider.blockedAt ? new Date(data.provider.blockedAt) : undefined,
				});
			} else {
				router.push("/404");
			}
		} catch (error) {
			console.error("Error checking provider status:", error);
			router.push("/404");
		} finally {
			setIsProviderLoading(false);
		}
	}, [providerId, router]);

	useEffect(() => {
		checkProviderStatus();
	}, [checkProviderStatus]);

	const handlePinVerification = async (pin: string) => {
		try {
			const response = await fetch("/provider-auth/api/verify-pin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ providerId, pin }),
				credentials: "include",
			});

			const data = await response.json();

			if (data.success) {
				await pinAuth.checkSession();
				return { success: true };
			} else {
				if (data.blocked) {
					await checkProviderStatus();
				}

				return {
					success: false,
					error: data.error,
					blocked: data.blocked,
					attempts: data.attempts,
					remainingAttempts: data.remainingAttempts,
				};
			}
		} catch (error) {
			console.error("PIN verification error:", error);
			return {
				success: false,
				error: "Failed to verify PIN. Please try again.",
			};
		}
	};

	const handlePinSetup = async (pin: string, confirmPin: string) => {
		try {
			const response = await fetch("/provider-auth/api/setup-pin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ providerId, pin, confirmPin }),
				credentials: "include",
			});

			const data = await response.json();

			if (data.success) {
				setProviderStatus((prev) =>
					prev
						? {
								...prev,
								needsSetup: false,
							}
						: null,
				);
				await pinAuth.checkSession();
				return { success: true };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			console.error("PIN setup error:", error);
			return {
				success: false,
				error: "Failed to set up PIN. Please try again.",
			};
		}
	};

	const handleRequestReset = async () => {
		setIsRequestingReset(true);
		try {
			const response = await fetch("/provider-auth/api/request-pin-reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: providerStatus?.email || "" }),
			});

			const data = await response.json();

			if (data.success) {
				toast({
					title: "Reset Link Sent!",
					description: "Check your email for PIN reset instructions.",
					variant: "default",
				});
				return true;
			} else {
				toast({
					title: "Error",
					description: data.error || "Failed to send reset email. Please try again.",
					variant: "destructive",
				});
				return false;
			}
		} catch (error) {
			console.error("Reset request error:", error);
			toast({
				title: "Error",
				description: "Failed to send reset email. Please try again.",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsRequestingReset(false);
		}
	};

	if (pinAuth.isLoading || isProviderLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="text-center">
					<div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					<p className="text-muted-foreground">
						{pinAuth.isAuthenticated ? "Authenticating ..." : "Loading..."}
					</p>
				</div>
			</div>
		);
	}

	if (!providerStatus) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<div className="text-center">
					<p className="text-destructive">Failed to load provider information</p>
				</div>
			</div>
		);
	}

	if (providerStatus.isBlocked) {
		return (
			<BlockedAccount
				onRequestResetAction={handleRequestReset}
				providerName={providerStatus.name}
				blockedAt={providerStatus.blockedAt}
				isRequestingReset={isRequestingReset}
			/>
		);
	}

	if (providerStatus.needsSetup) {
		return <PinSetup onPinSetupAction={handlePinSetup} providerName={providerStatus.name} />;
	}

	if (!isAuthenticatedForProvider) {
		return (
			<PinEntry
				onPinSubmitAction={handlePinVerification}
				attempts={providerStatus.failedAttempts}
				providerName={providerStatus.name}
			/>
		);
	}

	return <>{children}</>;
}
