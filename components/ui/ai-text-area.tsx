"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, CheckCheck, Edit3, Zap, Loader2, FileText, X } from "lucide-react";
import * as React from "react";
import { useState, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface QuickAIAction {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
	action: "rewrite" | "grammar" | "enhance" | "simplify";
}

const DEFAULT_QUICK_AI_ACTIONS: QuickAIAction[] = [
	{
		id: "enhance",
		label: "Enhance",
		icon: Zap,
		description: "Make it more professional and polite",
		action: "enhance",
	},
	{
		id: "simplify",
		label: "Simplify",
		icon: FileText,
		description: "Use simpler, clearer words",
		action: "simplify",
	},
	{
		id: "grammar",
		label: "Fix Grammar",
		icon: CheckCheck,
		description: "Fix grammar and spelling",
		action: "grammar",
	},
	{
		id: "rewrite",
		label: "Rewrite",
		icon: Edit3,
		description: "Rewrite for clarity",
		action: "rewrite",
	},
];

interface AIActionResult {
	success: boolean;
	data?: {
		originalText: string;
		improvedText: string;
		improvements: string[];
	};
	error?: string;
}

interface AITextAreaProps {
	placeholder?: string;
	writingAssistantPlaceholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	onAIAction?: (
		action: string,
		originalText: string,
		improvedText: string,
		improvements: string[],
	) => void;
	className?: string;
	minHeight?: number;
	maxHeight?: number;
	disabled?: boolean;
	rows?: number;
	context?: string;
	aiActionHandler?: (params: {
		text: string;
		action: string;
		context?: string;
		customPrompt?: string;
	}) => Promise<AIActionResult>;
	quickActions?: QuickAIAction[];
	showAIButton?: boolean;
	showSelectionPopover?: boolean;
	enableTypingAnimation?: boolean;

	aiButtonClassName?: string;
	popoverClassName?: string;
	textareaClassName?: string;
}

export const AITextArea = ({
	placeholder = "Start writing...",
	value = "",
	onChange,
	onAIAction,
	className,
	minHeight = 120,
	maxHeight = 300,
	disabled = false,
	rows = 3,
	context = "general",
	writingAssistantPlaceholder = "Describe what you'd like to write, what specific requirements you have...",
	aiActionHandler,
	quickActions = DEFAULT_QUICK_AI_ACTIONS,
	showAIButton = true,
	showSelectionPopover = true,
	enableTypingAnimation = true,
	aiButtonClassName,
	popoverClassName,
	textareaClassName,
}: AITextAreaProps) => {
	const [text, setText] = useState(value);
	const [selectedText, setSelectedText] = useState("");
	const [selectionStart, setSelectionStart] = useState(0);
	const [selectionEnd, setSelectionEnd] = useState(0);
	const [showSelectionPopoverState, setShowSelectionPopoverState] = useState(false);
	const [showAIPopover, setShowAIPopover] = useState(false);
	const [customPrompt, setCustomPrompt] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingAction, setProcessingAction] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [justDismissed, setJustDismissed] = useState(false);

	const { textareaRef, adjustHeight } = useAutoResizeTextarea({
		minHeight,
		maxHeight,
	});

	useEffect(() => {
		setText(value);
	}, [value]);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setText(newValue);
		onChange?.(newValue);
		adjustHeight();

		if (justDismissed) {
			setJustDismissed(false);
		}
	};

	const handleTextSelect = () => {
		if (!showSelectionPopover) return;

		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = textarea.value.substring(start, end);

		if (justDismissed && start === selectionStart && end === selectionEnd) {
			return;
		}

		if (justDismissed) {
			setJustDismissed(false);
		}

		if (selected.length > 0 && selected.trim().length > 0) {
			setSelectedText(selected);
			setSelectionStart(start);
			setSelectionEnd(end);
			setShowSelectionPopoverState(true);
		} else {
			setShowSelectionPopoverState(false);
		}
	};

	const handleCloseButtonClick = () => {
		setShowSelectionPopoverState(false);
		setJustDismissed(true);
		setTimeout(() => {
			const textarea = textareaRef.current;
			if (textarea) {
				textarea.focus();
				if (selectedText && selectionStart !== selectionEnd) {
					textarea.setSelectionRange(selectionStart, selectionEnd);
				}
			}
		}, 0);
	};

	const handlePopoverOpenChange = (open: boolean) => {
		if (!open) {
			setShowSelectionPopoverState(false);
		} else {
			setShowSelectionPopoverState(open);
		}
	};

	const handleAIQuickAction = async (action: QuickAIAction) => {
		if (!selectedText || isProcessing || !aiActionHandler) return;

		setShowSelectionPopoverState(false);
		setIsProcessing(true);
		setProcessingAction(action.id);

		try {
			const result = await aiActionHandler({
				text: selectedText,
				action: action.action,
				context,
			});

			if (result.success && result.data) {
				replaceSelectedText(result.data.improvedText);

				onAIAction?.(
					action.action,
					result.data.originalText,
					result.data.improvedText,
					result.data.improvements,
				);
			} else {
				throw new Error(result.error || "Failed to improve text");
			}
		} catch (error) {
			console.error("AI enhancement error:", error);
			onAIAction?.(`${action.id}_error`, selectedText, selectedText, [
				error instanceof Error ? error.message : "Unknown error",
			]);
		} finally {
			setIsProcessing(false);
			setProcessingAction(null);
		}
	};

	const handleCustomAIPrompt = async () => {
		if (!customPrompt.trim() || isProcessing || !aiActionHandler) return;

		setShowAIPopover(false);
		setIsProcessing(true);
		setProcessingAction("custom");

		try {
			const action = text.trim() === "" ? "generate" : "custom";

			const result = await aiActionHandler({
				text: text.trim() === "" ? customPrompt : text,
				action: action,
				context,
				customPrompt: customPrompt,
			});

			if (result.success && result.data) {
				await replaceAllText(result.data.improvedText);

				onAIAction?.(
					action,
					text.trim() === "" ? "" : result.data.originalText,
					result.data.improvedText,
					result.data.improvements,
				);
			} else {
				throw new Error(result.error || "Failed to generate text");
			}

			setCustomPrompt("");
		} catch (error) {
			console.error("AI generation error:", error);
			onAIAction?.("custom_error", text, text, [
				error instanceof Error ? error.message : "Unknown error",
			]);
			setCustomPrompt("");
		} finally {
			setIsProcessing(false);
			setProcessingAction(null);
		}
	};

	const typeText = useCallback(
		async (targetText: string, startPos: number, endPos: number) => {
			if (!enableTypingAnimation) {
				const beforeSelection = text.substring(0, startPos);
				const afterSelection = text.substring(endPos);
				const updatedText = beforeSelection + targetText + afterSelection;
				setText(updatedText);
				onChange?.(updatedText);
				return;
			}

			setIsTyping(true);
			const beforeSelection = text.substring(0, startPos);
			const afterSelection = text.substring(endPos);

			const clearedText = beforeSelection + afterSelection;
			setText(clearedText);
			onChange?.(clearedText);

			for (let i = 0; i <= targetText.length; i++) {
				const currentText = beforeSelection + targetText.substring(0, i) + afterSelection;
				setText(currentText);
				onChange?.(currentText);

				const delay = Math.max(10, 30 - targetText.length / 20);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			setIsTyping(false);
			adjustHeight();
		},
		[text, onChange, adjustHeight, enableTypingAnimation],
	);

	const replaceSelectedText = (newText: string) => {
		if (isTyping) return;

		if (isProcessing && enableTypingAnimation) {
			typeText(newText, selectionStart, selectionEnd);
		} else {
			const beforeSelection = text.substring(0, selectionStart);
			const afterSelection = text.substring(selectionEnd);
			const updatedText = beforeSelection + newText + afterSelection;
			setText(updatedText);
			onChange?.(updatedText);
		}
	};

	const replaceAllText = useCallback(
		async (newText: string) => {
			if (isTyping) return;

			if (!enableTypingAnimation) {
				setText(newText);
				onChange?.(newText);
				return;
			}

			setIsTyping(true);

			setText("");
			onChange?.("");

			for (let i = 0; i <= newText.length; i++) {
				const currentText = newText.substring(0, i);
				setText(currentText);
				onChange?.(currentText);

				const delay = Math.max(10, 30 - newText.length / 20);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			setIsTyping(false);
			adjustHeight();
		},
		[isTyping, onChange, adjustHeight, enableTypingAnimation],
	);

	const isAIFeatureEnabled = aiActionHandler && (showAIButton || showSelectionPopover);

	return (
		<div className={cn("w-full space-y-2", className)}>
			<div className="relative">
				<div className="flex items-start gap-2">
					<div className="relative flex-1">
						<motion.div
							animate={{
								scale: isProcessing && !isTyping ? 1.01 : 1,
							}}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
						>
							<Textarea
								ref={textareaRef}
								value={text}
								onChange={handleTextChange}
								onSelect={handleTextSelect}
								placeholder={placeholder}
								disabled={disabled}
								rows={rows}
								className={cn(
									"resize-none border-2 border-border",
									"focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
									"rounded-lg px-4 py-3 text-base leading-relaxed",
									"bg-background text-foreground placeholder:text-muted-foreground",
									"transition-all duration-200",
									disabled && "cursor-not-allowed opacity-50",
									(isProcessing || isTyping) && "border-primary/30 shadow-sm",
									isTyping && "text-primary/80",
									textareaClassName,
								)}
								style={{ minHeight: `${minHeight}px` }}
							/>
						</motion.div>

						{/* AI Processing Shimmer Overlay */}
						<AnimatePresence>
							{(isProcessing || isTyping) && isAIFeatureEnabled && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
								>
									{/* Shimmer gradient overlay */}
									{isProcessing && !isTyping && (
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
											animate={{
												x: ["-100%", "100%"],
											}}
											transition={{
												duration: 1.5,
												repeat: Infinity,
												ease: "linear",
											}}
										/>
									)}

									{/* Subtle glow effect */}
									<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

									{/* Processing indicator */}
									<div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-primary/20 bg-background/80 px-2 py-1 backdrop-blur-sm">
										<Sparkles className="size-3 animate-pulse text-primary" />
										<span className="text-xs font-medium text-primary">
											{isTyping ? "Writing..." : "Generating..."}
										</span>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Selection Popover */}
						{showSelectionPopoverState && selectedText && !disabled && showSelectionPopover && (
							<Popover open={showSelectionPopoverState} onOpenChange={handlePopoverOpenChange}>
								<PopoverTrigger asChild>
									<div className="absolute left-0 top-0 size-0" />
								</PopoverTrigger>
								<PopoverContent className={cn("w-72 p-3", popoverClassName)} side="top">
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="text-sm font-medium text-foreground">Improve Text</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleCloseButtonClick}
												className="size-6 p-0 hover:bg-muted"
											>
												<X className="size-3" />
											</Button>
										</div>
										<div className="rounded border bg-muted/50 p-2 text-xs text-muted-foreground">
											&quot;
											{selectedText.length > 40
												? selectedText.substring(0, 40) + "..."
												: selectedText}
											&quot;
										</div>
										<div className="grid grid-cols-2 gap-1">
											{quickActions.map((action) => (
												<Button
													key={action.id}
													variant="outline"
													size="sm"
													onClick={() => handleAIQuickAction(action)}
													disabled={isProcessing || isTyping}
													className="h-auto flex-col gap-1 p-2"
													title={action.description}
												>
													{isProcessing && processingAction === action.id ? (
														<Loader2 className="size-3 animate-spin" />
													) : (
														<action.icon className="size-3" />
													)}
													<span className="text-xs">{action.label}</span>
												</Button>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>
						)}
					</div>

					{/* AI Button */}
					{!disabled && showAIButton && isAIFeatureEnabled && (
						<Popover open={showAIPopover} onOpenChange={setShowAIPopover}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									disabled={isProcessing || isTyping}
									className={cn(
										"size-12 shrink-0 rounded-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5",
										aiButtonClassName,
									)}
								>
									{isProcessing || isTyping ? (
										<Loader2 className="size-5 animate-spin text-primary" />
									) : (
										<Sparkles className="size-5 text-primary" />
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className={cn("w-72 p-3", popoverClassName)} side="left">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Wand2 className="size-4 text-primary" />
										<span className="font-medium text-foreground">Writing Assistant</span>
									</div>

									<Textarea
										placeholder={
											text.trim() === ""
												? writingAssistantPlaceholder
												: "Tell me how to improve your text..."
										}
										value={customPrompt}
										onChange={(e) => setCustomPrompt(e.target.value)}
										className="min-h-[80px] resize-none text-sm"
									/>

									<div className="flex gap-2">
										<Button
											onClick={handleCustomAIPrompt}
											disabled={!customPrompt.trim() || isProcessing || isTyping}
											className="flex-1"
											size="sm"
										>
											{isProcessing && processingAction === "custom" ? (
												<Loader2 className="mr-1 size-3 animate-spin" />
											) : (
												<Sparkles className="mr-1 size-3" />
											)}
											{text.trim() === "" ? "Generate" : "Improve"}
										</Button>
										<Button variant="outline" onClick={() => setShowAIPopover(false)} size="sm">
											Cancel
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					)}
				</div>
			</div>
		</div>
	);
};

export type { QuickAIAction, AIActionResult, AITextAreaProps };
export { DEFAULT_QUICK_AI_ACTIONS };
