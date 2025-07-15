"use client";

import { Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MessageComparisonProps {
	originalMessage: string;
	cleanedMessage: string;
	contactDetailsDetected: boolean;
}

export const MessageComparison = ({
	originalMessage,
	cleanedMessage,
	contactDetailsDetected,
}: MessageComparisonProps) => {
	const [showOriginal, setShowOriginal] = useState(true);

	return (
		<div className="space-y-3">
			{/* Toggle Controls */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium">Message Comparison</h3>
					<Badge variant={contactDetailsDetected ? "destructive" : "secondary"} className="text-xs">
						{contactDetailsDetected ? "Contains Contact Info" : "Clean"}
					</Badge>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowOriginal(!showOriginal)}
					className="h-7 px-3"
				>
					{showOriginal ? (
						<>
							<EyeOff className="mr-1 size-3" />
							<span className="text-xs">Show Cleaned</span>
						</>
					) : (
						<>
							<Eye className="mr-1 size-3" />
							<span className="text-xs">Show Original</span>
						</>
					)}
				</Button>
			</div>

			{/* Message Display */}
			<Card className="border-0 bg-muted/30 shadow-none">
				<CardHeader className="px-4 pb-2 pt-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						{showOriginal ? (
							<>
								{contactDetailsDetected ? (
									<AlertTriangle className="size-4 text-destructive" />
								) : (
									<CheckCircle className="size-4 text-green-500 dark:text-green-400" />
								)}
								<span>Original Message</span>
							</>
						) : (
							<>
								<CheckCircle className="size-4 text-green-500 dark:text-green-400" />
								<span>Cleaned Message</span>
							</>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-4">
					<div
						className={cn(
							"rounded-md p-4 text-sm leading-relaxed transition-colors",
							showOriginal
								? contactDetailsDetected
									? "border border-destructive/20 bg-destructive/10 dark:bg-destructive/5"
									: "bg-muted/50"
								: "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
						)}
					>
						{showOriginal
							? originalMessage || "No original message available"
							: cleanedMessage || "No cleaned message available"}
					</div>

					{/* Warning message for original with contact info */}
					{showOriginal && contactDetailsDetected && (
						<div className="mt-2 flex items-start gap-2 text-xs text-destructive">
							<AlertTriangle className="mt-0.5 size-3 shrink-0" />
							<span>
								This message contains contact information that violates platform policies.
							</span>
						</div>
					)}

					{/* Success message for cleaned version */}
					{!showOriginal && (
						<div className="mt-2 flex items-start gap-2 text-xs text-green-600 dark:text-green-400">
							<CheckCircle className="mt-0.5 size-3 shrink-0" />
							<span>This message has been processed to comply with platform policies.</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Message Stats */}
			<div className="grid grid-cols-2 gap-2">
				<Card className="border-0 bg-muted/20 shadow-none">
					<CardContent className="p-3 text-center">
						<div className="text-lg font-semibold">{originalMessage.length}</div>
						<p className="text-xs text-muted-foreground">Original Length</p>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/20 shadow-none">
					<CardContent className="p-3 text-center">
						<div className="text-lg font-semibold">{cleanedMessage.length}</div>
						<p className="text-xs text-muted-foreground">Cleaned Length</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
