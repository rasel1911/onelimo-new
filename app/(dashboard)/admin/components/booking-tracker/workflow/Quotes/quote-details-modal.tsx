"use client";

import {
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
	Sparkles,
	DollarSign,
	AlertCircle,
	CheckCircle2,
	Brain,
	FileText,
	Loader2,
	RefreshCw,
	TrendingUp,
	Target,
	Users,
	X,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { useQuoteAnalysis } from "@/hooks/use-quote-analysis";

interface QuoteDetailsModalProps {
	isOpen: boolean;
	onCloseAction: () => void;
	workflowRunId?: string;
}

export const QuoteDetailsModal = ({
	isOpen,
	onCloseAction,
	workflowRunId,
}: QuoteDetailsModalProps) => {
	const [activeTab, setActiveTab] = useState("analysis");
	const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [selectedQuoteForFeedback, setSelectedQuoteForFeedback] = useState<WorkflowQuote | null>(
		null,
	);

	const { data, isLoading, error, fetchQuoteAnalysis, clearData } = useQuoteAnalysis();

	useEffect(() => {
		if (isOpen && workflowRunId && !data) {
			fetchQuoteAnalysis(workflowRunId);
		}
	}, [isOpen, workflowRunId, data, fetchQuoteAnalysis]);

	useEffect(() => {
		if (!isOpen) {
			clearData();
			setActiveTab("analysis");
		}
	}, [isOpen, clearData]);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-GB", {
			style: "currency",
			currency: "GBP",
		}).format(amount);

	const formatScore = (score: string | null) => {
		if (!score) return 0;
		return Number.parseInt(score, 10);
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600 dark:text-green-400";
		if (score >= 80) return "text-yellow-600 dark:text-yellow-400";
		if (score >= 70) return "text-orange-600 dark:text-orange-400";
		return "text-red-600 dark:text-red-400";
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value);
	};

	const handleQuoteFeedback = (quoteId: string, feedback: "upvote" | "downvote") => {
		// TODO: Implement quote feedback API call
		console.log(`Feedback for quote ${quoteId}: ${feedback}`);
	};

	const handleAnalysisReportView = (quote: WorkflowQuote) => {
		setSelectedQuoteForFeedback(quote);
		setFeedbackModalOpen(true);
	};

	const handleSubmitFeedback = () => {
		// TODO: Implement feedback submission
		console.log("Feedback submitted:", feedbackText);
		setFeedbackText("");
		setFeedbackModalOpen(false);
		setSelectedQuoteForFeedback(null);
	};

	const LoadingSkeleton = () => (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<Card key={i}>
					<CardHeader>
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	const AnalysisOverview = () => {
		if (!data?.analysisOverview) return null;

		const { analysisOverview } = data;

		return (
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Brain className="size-5 text-blue-600" />
						AI Analysis Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">{analysisOverview.totalQuotes}</div>
							<div className="text-sm text-muted-foreground">Total Quotes</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{analysisOverview.recommendedQuotes}
							</div>
							<div className="text-sm text-muted-foreground">Recommended</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{analysisOverview.averageScore}%
							</div>
							<div className="text-sm text-muted-foreground">Avg Score</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">{data.analysisConfidence}%</div>
							<div className="text-sm text-muted-foreground">Confidence</div>
						</div>
					</div>
					<Separator className="my-4" />
					<div>
						<div className="mb-2 flex items-center justify-between">
							<h4 className="font-medium">Market Insights</h4>
							{analysisOverview.selectionStrategy && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setSelectedQuoteForFeedback(null);
										setFeedbackText(analysisOverview.selectionStrategy);
										setFeedbackModalOpen(true);
									}}
									className="h-7"
								>
									<FileText className="mr-1 size-3" />
									View Strategy
								</Button>
							)}
						</div>
						<ul className="space-y-1 text-sm text-muted-foreground">
							{analysisOverview.marketInsights.slice(0, 3).map((insight, index) => (
								<li key={index} className="flex items-start gap-2">
									<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
									{insight}
								</li>
							))}
							{analysisOverview.marketInsights.length > 3 && (
								<li className="text-xs text-muted-foreground/70">
									+{analysisOverview.marketInsights.length - 3} more insights
								</li>
							)}
						</ul>
					</div>
				</CardContent>
			</Card>
		);
	};

	const QuoteCard = ({
		quote,
		isSelected = false,
	}: {
		quote: WorkflowQuote;
		isSelected?: boolean;
	}) => (
		<Card className={`${quote.isRecommended ? "ring-2 ring-green-500/20" : ""}`}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">{quote.providerName}</CardTitle>
						<p className="text-sm text-muted-foreground">Quote ID: {quote.quoteId.slice(0, 8)}</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className={getScoreColor(Number(quote.overallScore))}>
							{formatScore(quote.overallScore)}% Match
						</Badge>
						{quote.isRecommended && (
							<Badge variant="default" className="bg-teal-600">
								<Sparkles className="mr-1 size-3" />
								Recommended
							</Badge>
						)}
						{quote.isSelectedByAi ? (
							<Badge variant="default" className="bg-green-600">
								<Sparkles className="mr-1 size-3" />
								Selected
							</Badge>
						) : (
							<Badge variant="outline" className="bg-red-600">
								<Sparkles className="mr-1 size-3" />
								Rejected
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Main metrics */}
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<div className="flex items-center gap-2">
						<DollarSign className="size-4 text-green-600" />
						<div>
							<div className="font-semibold">{formatCurrency(quote.amount || 0)}</div>
							<div className="text-xs text-muted-foreground">Amount</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Target className="size-4 text-blue-600" />
						<div>
							<div className="font-semibold">{formatScore(quote.viabilityScore)}/100</div>
							<div className="text-xs text-muted-foreground">Viability</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Users className="size-4 text-purple-600" />
						<div>
							<div className="font-semibold">{formatScore(quote.seriousnessScore)}/100</div>
							<div className="text-xs text-muted-foreground">Seriousness</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<TrendingUp className="size-4 text-orange-600" />
						<div>
							<div className="font-semibold">{formatScore(quote.professionalismScore)}/100</div>
							<div className="text-xs text-muted-foreground">Professionalism</div>
						</div>
					</div>
				</div>

				{/* Overall Score Progress */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Overall Score</span>
						<span className={getScoreColor(Number(quote.overallScore))}>
							{formatScore(quote.overallScore)}/100
						</span>
					</div>
					<Progress value={Number(quote.overallScore)} className="h-1" />
				</div>

				{/* Analysis Notes with View Details Button */}
				<div className="text-sm">
					<div className="mb-2 flex items-center justify-between">
						<p className="font-medium">Analysis Summary:</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleAnalysisReportView(quote)}
							className="h-7"
						>
							<FileText className="mr-1 size-3" />
							View Details
						</Button>
					</div>
					<p className="line-clamp-1 text-muted-foreground">
						{quote.analysisNotes || "No analysis notes available"}
					</p>
				</div>

				{/* Strengths and Concerns */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<p className="mb-1 text-sm font-medium text-green-600">Strengths</p>
						<ul className="space-y-1 text-xs">
							{(quote.strengths as string[])?.map((strength, index) => (
								<li key={index} className="flex items-center gap-1">
									<CheckCircle2 className="size-3 text-green-600" />
									{strength}
								</li>
							)) || <li className="text-muted-foreground">No strengths listed</li>}
						</ul>
					</div>
					<div>
						<p className="mb-1 text-sm font-medium text-orange-600">Concerns</p>
						<ul className="space-y-1 text-xs">
							{(quote.concerns as string[])?.map((concern, index) => (
								<li key={index} className="flex items-center gap-1">
									<AlertCircle className="size-3 text-orange-600" />
									{concern}
								</li>
							)) || <li className="text-muted-foreground">No concerns listed</li>}
						</ul>
					</div>
				</div>

				{/* Key Points */}
				{quote.keyPoints && (quote.keyPoints as string[]).length > 0 && (
					<div>
						<p className="mb-1 text-sm font-medium">Key Points</p>
						<div className="flex flex-wrap gap-1">
							{(quote.keyPoints as string[]).map((point, index) => (
								<Badge key={index} variant="secondary" className="text-xs">
									{point}
								</Badge>
							))}
						</div>
					</div>
				)}

				{isSelected && (
					<>
						<Separator />
						<div className="space-y-3">
							<div>
								<p className="mb-1 text-sm font-medium">
									{quote.isSelectedByAi ? "Selection Reason" : "Rejection Reason"}
								</p>
								<p className="text-sm text-muted-foreground">
									{quote.isSelectedByAi
										? quote.recommendationReason || "No recommendation reason provided"
										: quote.reason || "No rejection reason provided"}
								</p>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-sm">
									<Sparkles className="size-4 text-blue-600" />
									<span>AI Selected: {quote.isSelectedByAi ? "Yes" : "No"}</span>
								</div>
								<div className="flex items-center gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleQuoteFeedback(quote.id, "upvote")}
									>
										<ThumbsUp className="size-4" />
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleQuoteFeedback(quote.id, "downvote")}
									>
										<ThumbsDown className="size-4" />
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onCloseAction}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="size-5 text-blue-600" />
						Quote Analysis & Selection
					</DialogTitle>
					<DialogDescription>
						AI-powered analysis of service quotes with intelligent recommendations
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
						<div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
							<AlertCircle className="size-4" />
							{error}
						</div>
					</div>
				)}

				<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
					<div className="flex items-center justify-between">
						<TabsList className="grid w-full max-w-md grid-cols-2">
							<TabsTrigger value="analysis">
								Analyzed Quotes {data ? `(${data.quotes.length})` : ""}
							</TabsTrigger>
							<TabsTrigger value="selected">
								Selected Quotes {data ? `(${data.selectedQuotes.length})` : ""}
							</TabsTrigger>
						</TabsList>
						<div className="flex items-center gap-2">
							{workflowRunId && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchQuoteAnalysis(workflowRunId)}
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<RefreshCw className="mr-2 size-4" />
									)}
									Refresh
								</Button>
							)}
							{/* <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(true)}>
								<MessageSquare className="mr-2 size-4" />
								Feedback
							</Button> */}
						</div>
					</div>

					<TabsContent value="analysis" className="space-y-6">
						{isLoading ? (
							<LoadingSkeleton />
						) : data ? (
							<>
								<AnalysisOverview />
								<div className="space-y-4">
									{data.quotes.map((quote) => (
										<QuoteCard key={quote.id} quote={quote} />
									))}
								</div>
							</>
						) : (
							<div className="py-8 text-center">
								<p className="text-muted-foreground">No quote analysis data available</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="selected" className="space-y-6">
						{isLoading ? (
							<LoadingSkeleton />
						) : data && data.selectedQuotes.length > 0 ? (
							<>
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<CheckCircle2 className="size-5 text-green-600" />
											AI Selected Quotes ({data.selectedQuotes.length})
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">
											These quotes were selected by our AI based on optimal price-to-value ratio,
											reliability scores, and service quality analysis.
										</p>
									</CardContent>
								</Card>
								<div className="space-y-4">
									{data.selectedQuotes.map((quote) => (
										<QuoteCard key={quote.id} quote={quote} isSelected />
									))}
								</div>
							</>
						) : (
							<div className="py-8 text-center">
								<p className="text-muted-foreground">No quotes have been selected by AI</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>

			{/* Analysis Details / Feedback Modal */}
			<Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{selectedQuoteForFeedback ? (
								<>
									<FileText className="size-5 text-blue-600" />
									Analysis Report Details
								</>
							) : feedbackText && !selectedQuoteForFeedback ? (
								<>
									<Brain className="size-5 text-purple-600" />
									AI Selection Strategy
								</>
							) : (
								<>
									<MessageSquare className="size-5 text-blue-600" />
									Improve AI Analysis
								</>
							)}
						</DialogTitle>
						<DialogDescription>
							{selectedQuoteForFeedback
								? "Detailed analysis report for the selected quote"
								: feedbackText && !selectedQuoteForFeedback
									? "AI strategy and reasoning for quote selection"
									: "Share your feedback to help us improve our recommendation system"}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{selectedQuoteForFeedback ? (
							<div className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">
											{selectedQuoteForFeedback.providerName}
										</CardTitle>
										<p className="text-sm text-muted-foreground">Detailed Analysis Report</p>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
											<div className="text-center">
												<div className="text-xl font-bold text-blue-600">
													{formatScore(selectedQuoteForFeedback.overallScore)}/100
												</div>
												<div className="text-sm text-muted-foreground">Overall Score</div>
											</div>
											<div className="text-center">
												<div className="text-xl font-bold text-green-600">
													{formatScore(selectedQuoteForFeedback.viabilityScore)}/100
												</div>
												<div className="text-sm text-muted-foreground">Viability</div>
											</div>
											<div className="text-center">
												<div className="text-xl font-bold text-purple-600">
													{formatScore(selectedQuoteForFeedback.seriousnessScore)}/100
												</div>
												<div className="text-sm text-muted-foreground">Seriousness</div>
											</div>
											<div className="text-center">
												<div className="text-xl font-bold text-orange-600">
													{formatScore(selectedQuoteForFeedback.professionalismScore)}/100
												</div>
												<div className="text-sm text-muted-foreground">Professionalism</div>
											</div>
										</div>
										<Separator />
										<div>
											<h4 className="mb-2 font-medium">Analysis Notes</h4>
											<p className="whitespace-pre-wrap text-sm text-muted-foreground">
												{selectedQuoteForFeedback.analysisNotes ||
													"No detailed analysis notes available."}
											</p>
										</div>
										{selectedQuoteForFeedback.recommendationReason && (
											<div>
												<h4 className="mb-2 font-medium">
													{selectedQuoteForFeedback.isSelectedByAi
														? "Selection Reason"
														: "Rejection Reason"}
												</h4>
												<p className="text-sm text-muted-foreground">
													{selectedQuoteForFeedback.recommendationReason}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						) : feedbackText && !selectedQuoteForFeedback ? (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Brain className="size-5 text-purple-600" />
										AI Selection Strategy
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-wrap text-sm text-muted-foreground">
										{feedbackText}
									</p>
								</CardContent>
							</Card>
						) : (
							<Textarea
								placeholder="What could be improved about this analysis? (e.g., pricing weights, reliability factors, missing criteria...)"
								value={feedbackText}
								onChange={(e) => setFeedbackText(e.target.value)}
								className="min-h-[200px]"
							/>
						)}
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setFeedbackText("");
									setFeedbackModalOpen(false);
									setSelectedQuoteForFeedback(null);
								}}
							>
								{selectedQuoteForFeedback || (feedbackText && !selectedQuoteForFeedback)
									? "Close"
									: "Cancel"}
							</Button>
							{!selectedQuoteForFeedback && !feedbackText && (
								<Button onClick={handleSubmitFeedback} disabled={!feedbackText.trim()}>
									Submit Feedback
								</Button>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
};
