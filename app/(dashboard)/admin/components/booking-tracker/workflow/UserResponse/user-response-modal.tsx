"use client";

import { MessageCircle, Brain, AlertCircle, CheckCircle2, Clock, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConfirmationAnalysis } from "@/db/schema/workflow/workflowRun.schema";
import { type ModalProps } from "@/lib/workflow/types/modal";

import { BaseModal } from "../shared";

interface UserResponseModalData {
	confirmationAnalysis: ConfirmationAnalysis | null;
	selectedQuoteDetails: {
		quoteId: string;
		providerId: string;
		amount: number;
		message: string;
	} | null;
	provider: {
		id: string;
		name: string;
		email: string;
		phone: string;
	} | null;
}

interface UserResponseModalProps extends ModalProps<UserResponseModalData> {}

export function UserResponseModal({ isOpen, onCloseAction, data }: UserResponseModalProps) {
	const { confirmationAnalysis, selectedQuoteDetails, provider } = data || {};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-GB", {
			style: "currency",
			currency: "GBP",
		}).format(amount / 100);

	const getIntentIcon = (intent: string) => {
		switch (intent) {
			case "confirmation":
				return <CheckCircle2 className="size-4 text-green-600" />;
			case "question":
				return <MessageCircle className="size-4 text-blue-600" />;
			case "concern":
				return <AlertCircle className="size-4 text-yellow-600" />;
			case "cancellation":
				return <AlertCircle className="size-4 text-red-600" />;
			default:
				return <MessageCircle className="size-4 text-gray-600" />;
		}
	};

	const getIntentColor = (intent: string) => {
		switch (intent) {
			case "confirmation":
				return "bg-green-100 text-green-800 hover:bg-green-100";
			case "question":
				return "bg-blue-100 text-blue-800 hover:bg-blue-100";
			case "concern":
				return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
			case "cancellation":
				return "bg-red-100 text-red-800 hover:bg-red-100";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-100";
		}
	};

	const getSentimentColor = (sentiment: string) => {
		switch (sentiment) {
			case "positive":
				return "text-green-600";
			case "negative":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "high":
				return "bg-red-500 hover:bg-red-600";
			case "medium":
				return "bg-amber-500 hover:bg-amber-600";
			default:
				return "bg-gray-500 hover:bg-gray-600";
		}
	};

	return (
		<BaseModal
			isOpen={isOpen}
			onCloseAction={onCloseAction}
			title="User Response Analysis"
			icon={<MessageCircle className="size-5 text-blue-600" />}
			description="Analysis of customer's response to quote selection"
			maxWidth="4xl"
			maxHeight="90vh"
		>
			<ScrollArea className="max-h-[70vh]">
				<div className="space-y-6 p-1">
					{/* Selected Quote Details */}
					{selectedQuoteDetails && provider && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle2 className="size-5 text-green-600" />
									Selected Quote
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Provider</p>
										<p className="text-lg font-semibold">{provider.name}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Amount</p>
										<p className="text-lg font-semibold text-green-600">
											{formatCurrency(selectedQuoteDetails.amount * 100)}
										</p>
									</div>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Provider Contact</p>
									<div className="mt-1 space-y-1">
										<p className="text-sm">{provider.email}</p>
										<p className="text-sm">{provider.phone}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* User Response Analysis */}
					{confirmationAnalysis ? (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Brain className="size-5 text-purple-600" />
									Response Analysis
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Analysis Overview */}
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="text-center">
										<div className="flex items-center justify-center gap-2">
											<Badge className={getIntentColor(confirmationAnalysis.intent)}>
												{confirmationAnalysis.intent}
											</Badge>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">Intent</p>
									</div>
									<div className="text-center">
										<div className="text-lg font-semibold text-blue-600">
											{confirmationAnalysis.confidence}%
										</div>
										<p className="text-xs text-muted-foreground">Confidence</p>
									</div>
									<div className="text-center">
										<Badge className={getUrgencyColor(confirmationAnalysis.urgency)}>
											{confirmationAnalysis.urgency}
										</Badge>
										<p className="mt-1 text-xs text-muted-foreground">Urgency</p>
									</div>
								</div>

								<Separator />

								{/* Messages */}
								<div className="space-y-4">
									<div>
										<h4 className="mb-2 text-sm font-medium">Original Message</h4>
										<div className="rounded-lg border bg-muted/50 p-3">
											<p className="text-sm">{confirmationAnalysis.originalMessage}</p>
										</div>
									</div>

									<div>
										<h4 className="mb-2 text-sm font-medium">Refined Message</h4>
										<div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/20">
											<p className="text-sm">{confirmationAnalysis.refinedMessage}</p>
										</div>
									</div>
								</div>

								<Separator />

								{/* Key Points */}
								<div>
									<h4 className="mb-2 text-sm font-medium">Key Points</h4>
									<div className="space-y-2">
										{confirmationAnalysis.keyPoints.map((point, index) => (
											<div key={index} className="flex items-start gap-2">
												<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
												<p className="text-sm">{point}</p>
											</div>
										))}
									</div>
								</div>

								{/* Contact Information */}
								{confirmationAnalysis.contactInfo && (
									<>
										<Separator />
										<div>
											<h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
												<User className="size-4" />
												Contact Information Detected
											</h4>
											<div className="grid grid-cols-1 gap-2 md:grid-cols-3">
												{confirmationAnalysis.contactInfo.name && (
													<div>
														<p className="text-xs text-muted-foreground">Name</p>
														<p className="text-sm font-medium">
															{confirmationAnalysis.contactInfo.name}
														</p>
													</div>
												)}
												{confirmationAnalysis.contactInfo.email && (
													<div>
														<p className="text-xs text-muted-foreground">Email</p>
														<p className="text-sm font-medium">
															{confirmationAnalysis.contactInfo.email}
														</p>
													</div>
												)}
												{confirmationAnalysis.contactInfo.phone && (
													<div>
														<p className="text-xs text-muted-foreground">Phone</p>
														<p className="text-sm font-medium">
															{confirmationAnalysis.contactInfo.phone}
														</p>
													</div>
												)}
											</div>
										</div>
									</>
								)}

								<Separator />

								{/* Analysis Metadata */}
								<div>
									<h4 className="mb-2 text-sm font-medium">Analysis Details</h4>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
										<div className="text-center">
											<span className="text-sm text-muted-foreground">Sentiment</span>
											<div
												className={`mt-1 text-base font-medium ${getSentimentColor(confirmationAnalysis.sentiment)}`}
											>
												{confirmationAnalysis.sentiment}
											</div>
										</div>
										<div className="text-center">
											<span className="text-sm text-muted-foreground">Requires Response</span>
											<div className="mt-1 text-base font-medium">
												{confirmationAnalysis.requiresResponse ? "Yes" : "No"}
											</div>
										</div>
										<div className="text-center">
											<span className="text-sm text-muted-foreground">Analyzed At</span>
											<div className="mt-1 text-base font-medium">
												{new Date(confirmationAnalysis.analyzedAt).toLocaleString()}
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-center">
									<div className="text-center">
										<Clock className="mx-auto mb-2 size-8 text-muted-foreground" />
										<p className="text-muted-foreground">No response analysis available</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</ScrollArea>
		</BaseModal>
	);
}
