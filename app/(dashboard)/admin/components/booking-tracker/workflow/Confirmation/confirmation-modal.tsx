"use client";

import { CheckCircle2, Mail, MessageSquare, Phone, AlertTriangle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ModalProps } from "@/lib/workflow/types/modal";

import { BaseModal } from "../shared";

interface ConfirmationModalData {
	providerNotificationResult: {
		success: boolean;
		results: any[];
		errors: string[];
		resultsCount?: number;
	} | null;
	customerNotificationResult: {
		success: boolean;
		results: any[];
		errors: string[];
		resultsCount?: number;
	} | null;
	provider: {
		id: string;
		name: string;
		email: string;
		phone: string;
	} | null;
	selectedQuoteDetails: {
		quoteId: string;
		providerId: string;
		amount: number;
		message: string;
	} | null;
	bookingId: string;
	urgent?: boolean;
}

interface ConfirmationModalProps extends ModalProps<ConfirmationModalData> {}

export function ConfirmationModal({ isOpen, onCloseAction, data }: ConfirmationModalProps) {
	const {
		providerNotificationResult,
		customerNotificationResult,
		provider,
		selectedQuoteDetails,
		bookingId,
		urgent,
	} = data || {};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-GB", {
			style: "currency",
			currency: "GBP",
		}).format(amount / 100);

	const getNotificationStatus = (result: any) => {
		if (!result) return "unknown";
		if (result.success && (!result.errors || result.errors.length === 0)) return "success";
		if (result.success && result.errors && result.errors.length > 0) return "partial";
		if (result.success && result.results && result.errors && result.errors.length === 0)
			return "success";
		if (result.success && result.results && result.errors && result.errors.length > 0)
			return "partial";
		return "failed";
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success":
				return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
			case "partial":
				return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <CheckCircle2 className="size-4 text-green-600" />;
			case "partial":
				return <AlertTriangle className="size-4 text-yellow-600" />;
			case "failed":
				return <AlertTriangle className="size-4 text-red-600" />;
			default:
				return <Clock className="size-4 text-gray-600" />;
		}
	};

	return (
		<BaseModal
			isOpen={isOpen}
			onCloseAction={onCloseAction}
			title="Booking Confirmation"
			icon={<CheckCircle2 className="size-5 text-green-600" />}
			description="Confirmation notifications sent to provider and customer"
			maxWidth="4xl"
			maxHeight="90vh"
		>
			<ScrollArea className="max-h-[70vh]">
				<div className="space-y-6 p-1">
					{/* Booking Summary */}
					{selectedQuoteDetails && provider && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle2 className="size-5 text-green-600" />
									Confirmed Booking
									{urgent && (
										<Badge className="bg-red-500 text-white hover:bg-red-600">Urgent</Badge>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Booking ID</p>
										<p className="font-mono text-lg font-semibold">{bookingId}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Provider</p>
										<p className="text-lg font-semibold">{provider.name}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Amount</p>
										<p className="text-lg font-semibold text-green-600">
											{formatCurrency(selectedQuoteDetails.amount)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Notification Status */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Provider Notifications */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Mail className="size-5 text-blue-600" />
									Provider Notifications
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Status</span>
									{getStatusBadge(getNotificationStatus(providerNotificationResult))}
								</div>

								{providerNotificationResult && (
									<>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Total Sent:</span>
												<span className="font-medium">
													{providerNotificationResult.results?.length ||
														providerNotificationResult.resultsCount ||
														0}
												</span>
											</div>
											{((providerNotificationResult.errors &&
												providerNotificationResult.errors.length > 0) ||
												(providerNotificationResult.resultsCount &&
													!providerNotificationResult.success)) && (
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Errors:</span>
													<span className="font-medium text-red-600">
														{providerNotificationResult.errors?.length || 0}
													</span>
												</div>
											)}
										</div>

										{providerNotificationResult.errors &&
											providerNotificationResult.errors.length > 0 && (
												<div className="space-y-2">
													<h5 className="text-sm font-medium text-red-600">Errors:</h5>
													<div className="space-y-1">
														{providerNotificationResult.errors.map((error, index) => (
															<div
																key={index}
																className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400"
															>
																{error}
															</div>
														))}
													</div>
												</div>
											)}
									</>
								)}

								{provider && (
									<div className="space-y-2 border-t pt-4">
										<h5 className="text-sm font-medium">Provider Contact</h5>
										<div className="space-y-1 text-sm">
											<div className="flex items-center gap-2">
												<Mail className="size-3 text-muted-foreground" />
												<span>{provider.email}</span>
											</div>
											<div className="flex items-center gap-2">
												<Phone className="size-3 text-muted-foreground" />
												<span>{provider.phone}</span>
											</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Customer Notifications */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MessageSquare className="size-5 text-green-600" />
									Customer Notifications
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Status</span>
									{getStatusBadge(getNotificationStatus(customerNotificationResult))}
								</div>

								{customerNotificationResult && (
									<>
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Total Sent:</span>
												<span className="font-medium">
													{customerNotificationResult.results?.length ||
														customerNotificationResult.resultsCount ||
														0}
												</span>
											</div>
											{((customerNotificationResult.errors &&
												customerNotificationResult.errors.length > 0) ||
												(customerNotificationResult.resultsCount &&
													!customerNotificationResult.success)) && (
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Errors:</span>
													<span className="font-medium text-red-600">
														{customerNotificationResult.errors?.length || 0}
													</span>
												</div>
											)}
										</div>

										{customerNotificationResult.errors &&
											customerNotificationResult.errors.length > 0 && (
												<div className="space-y-2">
													<h5 className="text-sm font-medium text-red-600">Errors:</h5>
													<div className="space-y-1">
														{customerNotificationResult.errors.map((error, index) => (
															<div
																key={index}
																className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400"
															>
																{error}
															</div>
														))}
													</div>
												</div>
											)}
									</>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Notification Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Confirmation Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										{getStatusIcon(getNotificationStatus(providerNotificationResult))}
										<span className="text-sm">
											Provider confirmation{" "}
											{getNotificationStatus(providerNotificationResult) === "success"
												? "sent successfully"
												: getNotificationStatus(providerNotificationResult) === "partial"
													? "partially sent"
													: "failed to send"}
										</span>
									</div>
									<div className="flex items-center gap-2">
										{getStatusIcon(getNotificationStatus(customerNotificationResult))}
										<span className="text-sm">
											Customer confirmation{" "}
											{getNotificationStatus(customerNotificationResult) === "success"
												? "sent successfully"
												: getNotificationStatus(customerNotificationResult) === "partial"
													? "partially sent"
													: "failed to send"}
										</span>
									</div>
								</div>

								{selectedQuoteDetails && (
									<div className="space-y-2">
										<h5 className="text-sm font-medium">Customer Message</h5>
										<div className="rounded-lg bg-muted/50 p-3">
											<p className="text-sm">
												{selectedQuoteDetails.message || "No message provided"}
											</p>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</BaseModal>
	);
}
