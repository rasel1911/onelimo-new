"use client";

import { Sparkles, Wand2, Check, X, Zap, Scissors } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { improveBookingResponseAction } from "../../actions/booking-ai-writer";

interface AITextAreaProps {
	label: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	registration?: UseFormRegisterReturn;
	error?: string;
	minHeight?: number;
	maxHeight?: number;
	className?: string;
	disabled?: boolean;
	required?: boolean;
	bookingContext?: {
		customerName?: string;
		vehicleType?: string;
		pickupLocation?: string;
		dropoffLocation?: string;
		pickupTime?: string;
		passengers?: number;
		specialRequests?: string;
		estimatedDuration?: number;
	};
}

export const AITextArea = forwardRef<HTMLTextAreaElement, AITextAreaProps>(
	(
		{
			label,
			placeholder = "Enter your message...",
			value,
			onChange,
			registration,
			error,
			minHeight = 100,
			maxHeight = 300,
			className = "",
			disabled = false,
			required = false,
			bookingContext,
		},
		forwardedRef,
	) => {
		const [internalValue, setInternalValue] = useState(value || "");
		const [isGenerating, setIsGenerating] = useState(false);
		const [showQuickActions, setShowQuickActions] = useState(false);
		const [selectedText, setSelectedText] = useState("");
		const [selectionStart, setSelectionStart] = useState(0);
		const [selectionEnd, setSelectionEnd] = useState(0);
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		const adjustHeight = useCallback(() => {
			const textarea = textareaRef.current;
			if (textarea) {
				textarea.style.height = "auto";
				const scrollHeight = textarea.scrollHeight;
				const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
				textarea.style.height = `${newHeight}px`;
				textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
			}
		}, [minHeight, maxHeight]);

		useEffect(() => {
			adjustHeight();
		}, [internalValue, minHeight, maxHeight, adjustHeight]);

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			setInternalValue(newValue);
			onChange?.(newValue);
			adjustHeight();
		};

		const handleTextSelection = () => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selected = textarea.value.substring(start, end);

			if (selected.length > 0) {
				setSelectedText(selected);
				setSelectionStart(start);
				setSelectionEnd(end);

				setShowQuickActions(true);
			} else {
				setShowQuickActions(false);
			}
		};

		const handleQuickAction = async (action: "grammar" | "enhance" | "shorten") => {
			setIsGenerating(true);
			setShowQuickActions(false);

			try {
				const actionMap = {
					grammar: "grammar" as const,
					enhance: "enhance" as const,
					shorten: "simplify" as const,
				};

				const result = await improveBookingResponseAction({
					text: selectedText,
					action: actionMap[action],
					context: "booking_note",
					bookingContext,
				});

				if (result.success && result.data) {
					const improvedText = result.data.improvedText;
					const newValue =
						internalValue.substring(0, selectionStart) +
						improvedText +
						internalValue.substring(selectionEnd);
					setInternalValue(newValue);
					onChange?.(newValue);

					setTimeout(() => {
						const textarea = textareaRef.current;
						if (textarea) {
							textarea.focus();
							textarea.setSelectionRange(selectionStart, selectionStart + improvedText.length);
						}
					}, 100);
				} else {
					console.error("AI improvement failed:", result.error);
					setTimeout(() => {
						const textarea = textareaRef.current;
						if (textarea) {
							textarea.focus();
							textarea.setSelectionRange(selectionStart, selectionEnd);
						}
					}, 100);
				}
			} catch (error) {
				console.error("Error improving text:", error);
				setTimeout(() => {
					const textarea = textareaRef.current;
					if (textarea) {
						textarea.focus();
						textarea.setSelectionRange(selectionStart, selectionEnd);
					}
				}, 100);
			} finally {
				setIsGenerating(false);
			}
		};

		const dismissQuickActions = (e?: React.MouseEvent) => {
			e?.preventDefault();
			e?.stopPropagation();
			setShowQuickActions(false);
			setTimeout(() => {
				const textarea = textareaRef.current;
				if (textarea) {
					textarea.focus();
					textarea.setSelectionRange(selectionStart, selectionEnd);
				}
			}, 100);
		};

		const handleAIGenerate = async () => {
			setIsGenerating(true);

			try {
				const hasExistingText = internalValue.trim().length > 0;

				if (hasExistingText) {
					const result = await improveBookingResponseAction({
						text: internalValue.trim(),
						action: "enhance",
						context: "booking_note",
						bookingContext,
					});

					if (result.success && result.data) {
						setInternalValue(result.data.improvedText);
						onChange?.(result.data.improvedText);
					} else {
						console.error("AI improvement failed:", result.error);
					}
				} else {
					const result = await improveBookingResponseAction({
						text: "Write a professional, concise, and friendly booking response for a transport service provider. Focus on confirming availability and expressing readiness to provide excellent service.",
						action: "generate",
						context: "booking_note",
						bookingContext,
					});

					if (result.success && result.data) {
						setInternalValue(result.data.improvedText);
						onChange?.(result.data.improvedText);
					} else {
						console.error("AI generation failed:", result.error);
						const fallbackResult = await improveBookingResponseAction({
							text: "I can accommodate your booking request and look forward to providing excellent service.",
							action: "enhance",
							context: "booking_note",
							bookingContext,
						});

						if (fallbackResult.success && fallbackResult.data) {
							setInternalValue(fallbackResult.data.improvedText);
							onChange?.(fallbackResult.data.improvedText);
						} else {
							setInternalValue(
								"Thank you for your booking request. I'm pleased to confirm that I can accommodate your requirements and look forward to providing you with excellent service.",
							);
							onChange?.(
								"Thank you for your booking request. I'm pleased to confirm that I can accommodate your requirements and look forward to providing you with excellent service.",
							);
						}
					}
				}
			} catch (error) {
				console.error("Error with AI generation:", error);
				if (!internalValue.trim()) {
					setInternalValue(
						"Thank you for your booking request. I'm pleased to confirm that I can accommodate your requirements and look forward to providing you with excellent service.",
					);
					onChange?.(
						"Thank you for your booking request. I'm pleased to confirm that I can accommodate your requirements and look forward to providing you with excellent service.",
					);
				}
			} finally {
				setIsGenerating(false);
			}
		};

		useEffect(() => {
			if (value !== undefined && value !== internalValue) {
				setInternalValue(value);
			}
		}, [internalValue, value]);

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (showQuickActions && textareaRef.current) {
					const target = event.target as Element;
					const isInsideTextarea = textareaRef.current.contains(target);
					const isInsidePopup = target.closest(".quick-actions-popup");

					if (!isInsideTextarea && !isInsidePopup) {
						setShowQuickActions(false);
					}
				}
			};

			if (showQuickActions) {
				document.addEventListener("mousedown", handleClickOutside);
				return () => document.removeEventListener("mousedown", handleClickOutside);
			}
		}, [showQuickActions]);

		return (
			<div className={`space-y-2 ${className}`}>
				{/* Label and AI Button Row */}
				<div className="flex items-center justify-between">
					<Label htmlFor={registration?.name || "ai-textarea"} className="text-sm font-medium">
						{label}
						{required && <span className="ml-1 text-red-500">*</span>}
					</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleAIGenerate}
						disabled={disabled || isGenerating}
						className="h-7 px-2 text-xs"
					>
						{internalValue.trim() ? (
							<>
								<Wand2 className="mr-1 size-3" />
								{isGenerating ? "Improving..." : "Improve"}
							</>
						) : (
							<>
								<Sparkles className="mr-1 size-3" />
								{isGenerating ? "Generating..." : "Write for me"}
							</>
						)}
					</Button>
				</div>

				{/* Textarea */}
				<div className="relative">
					<Textarea
						{...registration}
						ref={textareaRef}
						id={registration?.name || "ai-textarea"}
						placeholder={placeholder}
						value={internalValue}
						onChange={handleChange}
						onSelect={handleTextSelection}
						onMouseUp={handleTextSelection}
						disabled={disabled}
						className={`resize-none transition-all duration-200 ${
							error ? "border-red-500 focus:border-red-500" : ""
						}`}
						style={{
							minHeight: `${minHeight}px`,
							maxHeight: `${maxHeight}px`,
						}}
					/>

					{/* Quick Actions Popup */}
					{showQuickActions && (
						<div className="quick-actions-popup absolute -top-12 right-0 z-50 flex items-center gap-1 rounded-lg border bg-popover p-1 shadow-lg">
							<Button
								size="sm"
								variant="ghost"
								onClick={() => handleQuickAction("grammar")}
								className="h-7 px-2 text-xs"
							>
								<Check className="mr-1 size-3" />
								Fix Grammar
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => handleQuickAction("enhance")}
								className="h-7 px-2 text-xs"
							>
								<Zap className="mr-1 size-3" />
								Enhance
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => handleQuickAction("shorten")}
								className="h-7 px-2 text-xs"
							>
								<Scissors className="mr-1 size-3" />
								Shorten
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={dismissQuickActions}
								className="h-7 px-1 text-xs"
							>
								<X className="size-3" />
							</Button>
						</div>
					)}

					{/* Loading indicator */}
					{isGenerating && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
							<div className="flex items-center space-x-2 text-sm text-muted-foreground">
								<div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
								<span className="animate-pulse">Writing...</span>
							</div>
						</div>
					)}
				</div>

				{/* Error Message */}
				{error && <p className="text-sm text-red-500">{error}</p>}
			</div>
		);
	},
);

AITextArea.displayName = "AITextArea";
