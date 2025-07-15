"use client";

import { Eye, EyeOff, Lock, Loader2, AlertTriangle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const MAX_PIN_ATTEMPTS = 3;

interface PinEntryProps {
	onPinSubmitAction: (pin: string) => Promise<{
		success: boolean;
		error?: string;
		attempts?: number;
	}>;
	isLoading?: boolean;
	attempts?: number;
	maxAttempts?: number;
	providerName?: string;
}

export const PinEntry = ({
	onPinSubmitAction,
	isLoading = false,
	attempts = 0,
	maxAttempts = MAX_PIN_ATTEMPTS,
	providerName = "Service Provider",
}: PinEntryProps) => {
	const [pin, setPin] = useState(["", "", "", ""]);
	const [showPin, setShowPin] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentAttempts, setCurrentAttempts] = useState(attempts);
	const [hasError, setHasError] = useState(false);
	const [isShaking, setIsShaking] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (!isLoading && !isSubmitting) {
			inputRefs.current[0]?.focus();
		}
	}, [isLoading, isSubmitting]);

	useEffect(() => {
		setCurrentAttempts(attempts);
	}, [attempts]);

	const triggerErrorAnimation = () => {
		setHasError(true);
		setIsShaking(true);
		setTimeout(() => {
			setIsShaking(false);
		}, 600);
	};

	const handleInputChange = async (index: number, value: string) => {
		if (value.length > 1) return;
		if (value && !/^\d$/.test(value)) return;

		if (hasError) {
			setHasError(false);
		}

		const newPin = [...pin];
		newPin[index] = value;
		setPin(newPin);

		if (value && index < 3) {
			inputRefs.current[index + 1]?.focus();
		}

		if (newPin.every((digit) => digit !== "") && !isSubmitting) {
			setIsSubmitting(true);
			const pinString = newPin.join("");

			try {
				const result = await onPinSubmitAction(pinString);
				if (!result.success) {
					if (result.attempts !== undefined) {
						setCurrentAttempts(result.attempts);
					}

					triggerErrorAnimation();
					setPin(["", "", "", ""]);
					setTimeout(() => {
						inputRefs.current[0]?.focus();
					}, 100);
				}
			} catch (error) {
				console.error("PIN submission error:", error);
				triggerErrorAnimation();
				setPin(["", "", "", ""]);
				setTimeout(() => {
					inputRefs.current[0]?.focus();
				}, 100);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !pin[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "Backspace" && pin[index]) {
			const newPin = [...pin];
			newPin[index] = "";
			setPin(newPin);
		} else if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowRight" && index < 3) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text");
		const digits = pastedText.replace(/\D/g, "").slice(0, 4).split("");

		if (digits.length > 0) {
			const newPin = ["", "", "", ""];
			digits.forEach((digit, index) => {
				if (index < 4) newPin[index] = digit;
			});
			setPin(newPin);

			const nextEmptyIndex = newPin.findIndex((digit) => digit === "");
			const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
			inputRefs.current[focusIndex]?.focus();
		}
	};

	const clearPin = () => {
		setPin(["", "", "", ""]);
		inputRefs.current[0]?.focus();
	};

	const remainingAttempts = maxAttempts - currentAttempts;
	const isNearLimit = remainingAttempts <= 1;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
						<Lock className="size-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">Enter PIN</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Welcome {providerName}. Enter your 4-digit PIN to access your booking requests.
					</p>
				</div>

				<div className="space-y-6">
					<div className={`flex justify-center space-x-3 ${isShaking ? "animate-shake" : ""}`}>
						{pin.map((digit, index) => (
							<div key={index} className="relative">
								<input
									ref={(el) => {
										inputRefs.current[index] = el;
									}}
									type={showPin ? "text" : "password"}
									value={digit}
									onChange={(e) => handleInputChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									onPaste={handlePaste}
									className={`size-14 rounded-lg border text-center text-xl font-semibold text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
										hasError
											? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive"
											: "border-input bg-background focus:border-ring focus:ring-ring"
									}`}
									placeholder="•"
									maxLength={1}
									disabled={isSubmitting || isLoading}
								/>
								{isSubmitting && index === 3 && (
									<div className="absolute inset-0 flex items-center justify-center">
										<Loader2 className="size-4 animate-spin text-primary" />
									</div>
								)}
							</div>
						))}
					</div>

					<div className="flex items-center justify-center space-x-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowPin(!showPin)}
							className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
							disabled={isSubmitting || isLoading}
						>
							{showPin ? (
								<>
									<EyeOff className="size-4" />
									<span>Hide PIN</span>
								</>
							) : (
								<>
									<Eye className="size-4" />
									<span>Show PIN</span>
								</>
							)}
						</Button>

						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearPin}
							className="text-muted-foreground hover:text-foreground"
							disabled={isSubmitting || isLoading || pin.every((digit) => digit === "")}
						>
							Clear
						</Button>
					</div>

					{currentAttempts > 0 && (
						<Alert variant={isNearLimit ? "destructive" : "default"}>
							<AlertTriangle className="size-4" />
							<AlertDescription>
								{isNearLimit
									? `Warning: ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining. Your account will be blocked after ${maxAttempts} failed attempts.`
									: `${currentAttempts} failed attempt${currentAttempts !== 1 ? "s" : ""}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`}
							</AlertDescription>
						</Alert>
					)}

					{isSubmitting && (
						<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							<span>Verifying PIN...</span>
						</div>
					)}
				</div>

				<div className="text-center">
					<p className="text-xs text-muted-foreground">
						Enter all 4 digits to automatically verify your PIN
					</p>
				</div>
			</div>
		</div>
	);
};
