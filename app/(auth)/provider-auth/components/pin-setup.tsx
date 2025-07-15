"use client";

import { Eye, EyeOff, Shield, Check, X, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PinSetupProps {
	onPinSetupAction: (
		pin: string,
		confirmPin: string,
	) => Promise<{ success: boolean; error?: string }>;
	isLoading?: boolean;
	error?: string;
	providerName?: string;
}

export const PinSetup = ({
	onPinSetupAction,
	isLoading = false,
	error,
	providerName = "Service Provider",
}: PinSetupProps) => {
	const [pin, setPin] = useState(["", "", "", ""]);
	const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
	const [showPin, setShowPin] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState<"pin" | "confirm">("pin");
	const [pinValidation, setPinValidation] = useState({
		length: false,
		noSequential: false,
		noRepeating: false,
	});

	const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (!isLoading && !isSubmitting) {
			if (currentStep === "pin") {
				pinInputRefs.current[0]?.focus();
			} else {
				confirmInputRefs.current[0]?.focus();
			}
		}
	}, [isLoading, isSubmitting, currentStep]);

	const validatePin = (pinArray: string[]) => {
		const pinString = pinArray.join("");

		if (pinString.length < 4) {
			return {
				length: false,
				noSequential: false,
				noRepeating: false,
			};
		}

		const length = pinString.length === 4;

		// Check for sequential numbers (1234, 4321)
		const sequential =
			/^(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(pinString);
		const noSequential = !sequential;

		// Check for repeating numbers (1111, 2222, etc)
		const repeating = /^(\d)\1{3}$/.test(pinString);
		const noRepeating = !repeating;

		return {
			length,
			noSequential,
			noRepeating,
		};
	};

	const handleInputChange = (index: number, value: string, inputType: "pin" | "confirm") => {
		if (value.length > 1) return;
		if (value && !/^\d$/.test(value)) return;

		if (inputType === "pin") {
			const newPin = [...pin];
			newPin[index] = value;
			setPin(newPin);
			setPinValidation(validatePin(newPin));

			if (value && index < 3) {
				pinInputRefs.current[index + 1]?.focus();
			}

			if (newPin.every((digit) => digit !== "")) {
				const validation = validatePin(newPin);
				if (validation.length && validation.noSequential && validation.noRepeating) {
					setTimeout(() => {
						setCurrentStep("confirm");
					}, 500);
				}
			}
		} else {
			const newConfirmPin = [...confirmPin];
			newConfirmPin[index] = value;
			setConfirmPin(newConfirmPin);

			if (value && index < 3) {
				confirmInputRefs.current[index + 1]?.focus();
			}

			if (newConfirmPin.every((digit) => digit !== "")) {
				handleSubmit(pin.join(""), newConfirmPin.join(""));
			}
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent, inputType: "pin" | "confirm") => {
		const currentArray = inputType === "pin" ? pin : confirmPin;
		const currentRefs = inputType === "pin" ? pinInputRefs : confirmInputRefs;
		const setter = inputType === "pin" ? setPin : setConfirmPin;

		if (e.key === "Backspace" && !currentArray[index] && index > 0) {
			currentRefs.current[index - 1]?.focus();
		} else if (e.key === "Backspace" && currentArray[index]) {
			const newArray = [...currentArray];
			newArray[index] = "";
			setter(newArray);
		} else if (e.key === "ArrowLeft" && index > 0) {
			currentRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowRight" && index < 3) {
			currentRefs.current[index + 1]?.focus();
		}
	};

	const handleSubmit = async (pinValue: string, confirmPinValue: string) => {
		if (pinValue !== confirmPinValue) {
			setConfirmPin(["", "", "", ""]);
			setCurrentStep("confirm");
			confirmInputRefs.current[0]?.focus();
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await onPinSetupAction(pinValue, confirmPinValue);
			if (!result.success) {
				setPin(["", "", "", ""]);
				setConfirmPin(["", "", "", ""]);
				setCurrentStep("pin");
				setPinValidation({
					length: false,
					noSequential: false,
					noRepeating: false,
				});
				setTimeout(() => {
					pinInputRefs.current[0]?.focus();
				}, 100);
			}
		} catch (error) {
			console.error("PIN setup error:", error);
			setPin(["", "", "", ""]);
			setConfirmPin(["", "", "", ""]);
			setCurrentStep("pin");
			setPinValidation({
				length: false,
				noSequential: false,
				noRepeating: false,
			});
			setTimeout(() => {
				pinInputRefs.current[0]?.focus();
			}, 100);
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setPin(["", "", "", ""]);
		setConfirmPin(["", "", "", ""]);
		setCurrentStep("pin");
		setPinValidation({
			length: false,
			noSequential: false,
			noRepeating: false,
		});
		pinInputRefs.current[0]?.focus();
	};

	const isPinValid =
		pinValidation.length && pinValidation.noSequential && pinValidation.noRepeating;
	const pinMatch = pin.join("") === confirmPin.join("") && confirmPin.every((d) => d !== "");

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
						<Shield className="size-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">Setup Your PIN</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Welcome {providerName}. Please create a secure 4-digit PIN to protect your account.
					</p>
				</div>

				<div className="space-y-6">
					{/* PIN Entry */}
					<div className="space-y-4">
						<div className="text-center">
							<h3 className="font-medium">
								{currentStep === "pin" ? "Create PIN" : "Confirm PIN"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{currentStep === "pin"
									? "Enter a secure 4-digit PIN"
									: "Re-enter your PIN to confirm"}
							</p>
						</div>

						<div className="flex justify-center space-x-3">
							{(currentStep === "pin" ? pin : confirmPin).map((digit, index) => (
								<div key={index} className="relative">
									<input
										ref={(el) => {
											if (currentStep === "pin") {
												pinInputRefs.current[index] = el;
											} else {
												confirmInputRefs.current[index] = el;
											}
										}}
										type={showPin ? "text" : "password"}
										value={digit}
										onChange={(e) => handleInputChange(index, e.target.value, currentStep)}
										onKeyDown={(e) => handleKeyDown(index, e, currentStep)}
										className="size-14 rounded-lg border border-input bg-background text-center text-xl font-semibold text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										placeholder="•"
										maxLength={1}
										disabled={isSubmitting || isLoading}
									/>
									{isSubmitting && index === 3 && currentStep === "confirm" && (
										<div className="absolute inset-0 flex items-center justify-center">
											<Loader2 className="size-4 animate-spin text-primary" />
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* PIN Validation */}
					{currentStep === "pin" && pin.some((d) => d !== "") && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium">PIN Requirements:</h4>
							<div className="space-y-1">
								<div className="flex items-center space-x-2 text-sm">
									{pinValidation.length ? (
										<Check className="size-4 text-green-500" />
									) : (
										<X className="size-4 text-muted-foreground" />
									)}
									<span
										className={pinValidation.length ? "text-green-600" : "text-muted-foreground"}
									>
										4 digits long
									</span>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									{pinValidation.noSequential ? (
										<Check className="size-4 text-green-500" />
									) : (
										<X className="size-4 text-muted-foreground" />
									)}
									<span
										className={
											pinValidation.noSequential ? "text-green-600" : "text-muted-foreground"
										}
									>
										No sequential numbers (1234, 4321)
									</span>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									{pinValidation.noRepeating ? (
										<Check className="size-4 text-green-500" />
									) : (
										<X className="size-4 text-muted-foreground" />
									)}
									<span
										className={
											pinValidation.noRepeating ? "text-green-600" : "text-muted-foreground"
										}
									>
										No repeating numbers (1111, 2222)
									</span>
								</div>
							</div>
						</div>
					)}

					{/* PIN Match Status */}
					{currentStep === "confirm" && confirmPin.some((d) => d !== "") && (
						<div className="text-center">
							{confirmPin.every((d) => d !== "") && (
								<div className="flex items-center justify-center space-x-2 text-sm">
									{pinMatch ? (
										<>
											<Check className="size-4 text-green-500" />
											<span className="text-green-600">PINs match!</span>
										</>
									) : (
										<>
											<X className="size-4 text-destructive" />
											<span className="text-destructive">PINs don&apos;t match</span>
										</>
									)}
								</div>
							)}
						</div>
					)}

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
							onClick={resetForm}
							className="text-muted-foreground hover:text-foreground"
							disabled={isSubmitting || isLoading}
						>
							Reset
						</Button>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{isSubmitting && (
						<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							<span>Setting up your PIN...</span>
						</div>
					)}
				</div>

				<div className="text-center">
					<p className="text-xs text-muted-foreground">
						Your PIN will be securely encrypted and stored. You&apos;ll need this PIN to access your
						booking requests.
					</p>
				</div>
			</div>
		</div>
	);
};
