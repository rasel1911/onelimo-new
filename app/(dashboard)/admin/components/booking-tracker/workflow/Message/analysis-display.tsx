"use client";

import {
	TrendingUp,
	Clock,
	Activity,
	DollarSign,
	CheckCircle,
	AlertTriangle,
	Shield,
	AlertCircle,
	Brain,
	MessageSquare,
	Star,
	Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalysisDisplayProps {
	analysis?: {
		score: number;
		urgency: "low" | "medium" | "high";
		complexity: "simple" | "moderate" | "complex";
		estimatedValue: number;
		keyPoints: string[];
		contactDetailsDetected: boolean;
		originalMessage: string;
		cleanedMessage: string;
		feedbackMessage: string;
	};
	className?: string;
}

export const AnalysisDisplay = ({ analysis, className }: AnalysisDisplayProps) => {
	if (!analysis) {
		return (
			<Card className={cn("border-0 shadow-none", className)}>
				<CardContent className="p-4 text-center text-muted-foreground">
					<p className="text-sm">No analysis data available</p>
				</CardContent>
			</Card>
		);
	}

	// Add fallback values for missing fields
	const score = analysis.score ?? 20;
	const urgency = analysis.urgency ?? "low";
	const complexity = analysis.complexity ?? "simple";
	const estimatedValue = analysis.estimatedValue ?? 0;
	const keyPoints = analysis.keyPoints ?? [];
	const contactDetailsDetected = analysis.contactDetailsDetected ?? false;
	const feedbackMessage = analysis.feedbackMessage ?? "Analysis completed successfully.";

	const getUrgencyIcon = (urgency: string) => {
		switch (urgency) {
			case "high":
				return <AlertTriangle className="size-3.5 text-destructive" />;
			case "medium":
				return <Clock className="size-3.5 text-yellow-500 dark:text-yellow-400" />;
			case "low":
				return <CheckCircle className="size-3.5 text-green-500 dark:text-green-400" />;
			default:
				return <Clock className="size-3.5" />;
		}
	};

	const getComplexityIcon = (complexity: string) => {
		switch (complexity) {
			case "complex":
				return <Activity className="size-3.5 text-destructive" />;
			case "moderate":
				return <Activity className="size-3.5 text-yellow-500 dark:text-yellow-400" />;
			case "simple":
				return <CheckCircle className="size-3.5 text-green-500 dark:text-green-400" />;
			default:
				return <Activity className="size-3.5" />;
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600 dark:text-green-400";
		if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
		return "text-destructive";
	};

	return (
		<div className={cn("space-y-3", className)}>
			{/* Score Display */}
			<Card className="border-0 bg-muted/30 shadow-none">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<Brain className="size-4 text-primary" />
								<span className="text-sm font-medium">AI Analysis Score</span>
							</div>
							<div className={cn("mb-2 text-2xl font-bold", getScoreColor(score))}>{score}/100</div>
							<Progress value={score} className="h-1.5" />
						</div>
						<TrendingUp className={cn("ml-4 size-6", getScoreColor(score))} />
					</div>
					{contactDetailsDetected && (
						<p className="mt-2 text-xs text-destructive">
							Score reduced due to contact policy violations
						</p>
					)}
				</CardContent>
			</Card>

			{/* Contact Detection Status */}
			<Card
				className={cn(
					"border-0 shadow-none",
					contactDetailsDetected
						? "bg-destructive/10 dark:bg-destructive/5"
						: "bg-green-50 dark:bg-green-950/20",
				)}
			>
				<CardContent className="p-3">
					<div className="flex items-center gap-2">
						{contactDetailsDetected ? (
							<>
								<AlertCircle className="size-4 text-destructive" />
								<span className="text-sm font-medium text-destructive">
									Contact Information Detected
								</span>
							</>
						) : (
							<>
								<Shield className="size-4 text-green-600 dark:text-green-400" />
								<span className="text-sm font-medium text-green-700 dark:text-green-300">
									Platform Compliant
								</span>
							</>
						)}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">{feedbackMessage}</p>
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<div className="grid grid-cols-3 gap-2">
				<Card className="border-0 bg-muted/20 shadow-none">
					<CardContent className="p-3 text-center">
						<div className="mb-1 flex items-center justify-center gap-1">
							{getUrgencyIcon(urgency)}
							<span className="text-xs font-medium capitalize">{urgency}</span>
						</div>
						<p className="text-xs text-muted-foreground">Urgency</p>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/20 shadow-none">
					<CardContent className="p-3 text-center">
						<div className="mb-1 flex items-center justify-center gap-1">
							{getComplexityIcon(complexity)}
							<span className="text-xs font-medium capitalize">{complexity}</span>
						</div>
						<p className="text-xs text-muted-foreground">Complexity</p>
					</CardContent>
				</Card>

				<Card className="border-0 bg-muted/20 shadow-none">
					<CardContent className="p-3 text-center">
						<div className="mb-1 flex items-center justify-center gap-1">
							<DollarSign className="size-3.5 text-green-600 dark:text-green-400" />
							<span className="text-xs font-medium">£{estimatedValue}</span>
						</div>
						<p className="text-xs text-muted-foreground">Est. Value</p>
					</CardContent>
				</Card>
			</div>

			{/* Key Points */}
			{keyPoints && keyPoints.length > 0 && (
				<Card className="border-0 bg-muted/20 shadow-none">
					<CardHeader className="px-4 pb-2 pt-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<Target className="size-4" />
							Key Points
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-3">
						<div className="space-y-1.5">
							{keyPoints.map((point, index) => (
								<div key={index} className="flex items-start gap-2 text-xs">
									<span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
									{point}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Message Quality */}
			<Card className="border-0 bg-muted/20 shadow-none">
				<CardHeader className="px-4 pb-2 pt-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<MessageSquare className="size-4" />
						Message Quality
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Star className="size-3.5 text-yellow-500 dark:text-yellow-400" />
							<span className="text-xs font-medium">Professional Presentation</span>
							<Badge
								variant={contactDetailsDetected ? "destructive" : "secondary"}
								className="px-1.5 py-0 text-xs"
							>
								{contactDetailsDetected ? "Issues Found" : "Excellent"}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">{feedbackMessage}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
