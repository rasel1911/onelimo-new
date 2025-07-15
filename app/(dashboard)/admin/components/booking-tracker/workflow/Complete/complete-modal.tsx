"use client";

import {
	CheckCircle2,
	Calendar,
	MapPin,
	Clock,
	DollarSign,
	User,
	Mail,
	Phone,
	Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type ModalProps } from "@/lib/workflow/types/modal";

import { BaseModal } from "../shared";

// Party SVG Component
const PartySVG = ({ className = "size-8" }: { className?: string }) => (
	<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g fill="currentColor">
			{/* Confetti pieces */}
			<circle cx="4" cy="4" r="1" fill="#f59e0b" />
			<rect x="19" y="2" width="2" height="2" rx="0.5" fill="#ef4444" />
			<circle cx="20" cy="6" r="1" fill="#10b981" />
			<rect x="2" y="18" width="2" height="2" rx="0.5" fill="#3b82f6" />
			<circle cx="18" cy="20" r="1" fill="#8b5cf6" />
			<rect x="6" y="2" width="1.5" height="1.5" rx="0.5" fill="#f97316" />
			<circle cx="3" cy="10" r="0.8" fill="#06b6d4" />
			<rect x="21" y="12" width="1.5" height="1.5" rx="0.5" fill="#ec4899" />

			{/* Main party popper */}
			<path
				d="M12 8l-2 2 2 2-2 2 2 2-2 2h8l-2-2 2-2-2-2 2-2-2-2h-4z"
				fill="#fbbf24"
				opacity="0.8"
			/>
			<path d="M10 8l2 2-2 2 2 2-2 2 2 2v2l-4-4 2-2-2-2 2-2-2-2 2-2z" fill="#f59e0b" />

			{/* Streamers */}
			<path d="M8 6c0 1 1 2 0 3s-1 2 0 3-1 2 0 3" stroke="#ef4444" strokeWidth="1.5" fill="none" />
			<path d="M16 6c0 1-1 2 0 3s1 2 0 3 1 2 0 3" stroke="#10b981" strokeWidth="1.5" fill="none" />
			<path d="M12 4c1 0 2 1 3 0s2-1 3 0 2 1 3 0" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
		</g>
	</svg>
);

interface CompleteModalData {
	workflowRun: {
		id: string;
		workflowRunId: string;
		status: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		selectedProviderId: string;
		selectedQuoteId: string;
		selectedQuoteAmount: number;
		selectedQuoteMessage: string;
		completedAt: string;
		startedAt: string;
	} | null;
	bookingRequest: {
		id: string;
		requestCode: string;
		customerName: string;
		vehicleType: string;
		pickupTime: string;
		pickupLocation: any;
		dropoffLocation: any;
		passengers: number;
		specialRequests: string;
		estimatedDuration: number;
	} | null;
	providerNotifications: {
		success: boolean;
		resultsCount: number;
		errors: string[];
	} | null;
	customerNotifications: {
		success: boolean;
		resultsCount: number;
		errors: string[];
	} | null;
	bookingId: string;
	completedAt: string;
}

interface CompleteModalProps extends ModalProps<CompleteModalData> {}

export function CompleteModal({ isOpen, onCloseAction, data }: CompleteModalProps) {
	const {
		workflowRun,
		bookingRequest,
		providerNotifications,
		customerNotifications,
		bookingId,
		completedAt,
	} = data || {};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-GB", {
			style: "currency",
			currency: "GBP",
		}).format(amount / 100);

	const formatDateTime = (date: string) => {
		return new Date(date).toLocaleDateString("en-GB", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	const getProcessingTime = () => {
		if (!workflowRun) return "N/A";
		const start = new Date(workflowRun.startedAt);
		const end = new Date(completedAt);
		const diff = end.getTime() - start.getTime();
		const minutes = Math.floor(diff / 60000);
		return formatDuration(minutes);
	};

	const getNotificationStatus = (notifications: any) => {
		if (!notifications) return "unknown";
		if (notifications.success && notifications.errors.length === 0) return "success";
		if (notifications.success && notifications.errors.length > 0) return "partial";
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

	return (
		<BaseModal
			isOpen={isOpen}
			onCloseAction={onCloseAction}
			title="Booking Complete"
			icon={<CheckCircle2 className="size-5 text-green-600" />}
			description="The booking has been successfully processed and confirmed"
			maxWidth="5xl"
			maxHeight="90vh"
		>
			<ScrollArea className="max-h-[75vh]">
				<div className="space-y-6 p-1">
					{/* Success Header with Party Theme */}
					<div className="relative text-center">
						{/* Floating confetti */}
						<div className="pointer-events-none absolute inset-0">
							<div className="absolute left-1/4 top-2 animate-bounce delay-100">
								<div className="size-2 rounded-full bg-yellow-400"></div>
							</div>
							<div className="absolute right-1/4 top-4 animate-bounce delay-300">
								<div className="size-1.5 rounded-full bg-blue-500"></div>
							</div>
							<div className="absolute left-1/3 top-6 animate-bounce delay-500">
								<div className="size-1 rounded-full bg-green-500"></div>
							</div>
							<div className="absolute right-1/3 top-3 animate-bounce delay-700">
								<div className="size-1.5 rounded-full bg-purple-500"></div>
							</div>
						</div>

						{/* Main success icon with party theme */}
						<div className="relative mx-auto">
							<div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 shadow-lg">
								<PartySVG className="size-10 text-emerald-600" />
							</div>
						</div>

						<h3 className="text-3xl font-bold text-emerald-500">🎉 Booking Complete!</h3>
						<p className="mt-2 text-lg text-muted-foreground">
							The booking has been successfully booked and confirmed with the service provider.
						</p>
						<div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600">
							<CheckCircle2 className="size-4" />
							<span className="font-medium">All confirmations sent</span>
						</div>
					</div>

					{/* Booking Summary */}
					{bookingRequest && workflowRun && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="size-5 text-yellow-500" />
									Booking Summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Calendar className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Booking Date & Time</p>
												<p className="font-medium">{formatDateTime(bookingRequest.pickupTime)}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Pickup Location</p>
												<p className="font-medium">
													{bookingRequest.pickupLocation?.address || "Address not available"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Dropoff Location</p>
												<p className="font-medium">
													{bookingRequest.dropoffLocation?.address || "Address not available"}
												</p>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<User className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Passenger Details</p>
												<p className="font-medium">
													{workflowRun.customerName} • {bookingRequest.passengers} passengers
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Estimated Duration</p>
												<p className="font-medium">
													{formatDuration(bookingRequest.estimatedDuration)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<DollarSign className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Total Amount</p>
												<p className="text-lg font-semibold text-green-600">
													{formatCurrency(workflowRun.selectedQuoteAmount * 100)}
												</p>
											</div>
										</div>
									</div>
								</div>

								{bookingRequest.specialRequests && (
									<>
										<Separator />
										<div>
											<p className="text-sm text-muted-foreground">Special Requests</p>
											<p className="font-medium">{bookingRequest.specialRequests}</p>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					)}

					{/* Process Summary */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Workflow Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="size-5 text-blue-600" />
									Process Summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Booking ID:</span>
										<span className="font-mono font-medium">{bookingId}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Processing Time:</span>
										<span className="font-medium">{getProcessingTime()}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Completed At:</span>
										<span className="font-medium">{formatDateTime(completedAt)}</span>
									</div>
									{workflowRun && (
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Workflow Status:</span>
											<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
												{workflowRun.status}
											</Badge>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Notification Status */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Mail className="size-5 text-green-600" />
									Notification Status
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Provider Notifications</span>
										{getStatusBadge(getNotificationStatus(providerNotifications))}
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Customer Notifications</span>
										{getStatusBadge(getNotificationStatus(customerNotifications))}
									</div>
								</div>

								{(providerNotifications?.errors.length || customerNotifications?.errors.length) && (
									<>
										<Separator />
										<div>
											<p className="text-sm font-medium text-red-600">Notification Issues:</p>
											<div className="mt-2 space-y-1">
												{providerNotifications?.errors.map((error, index) => (
													<div
														key={index}
														className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400"
													>
														Provider: {error}
													</div>
												))}
												{customerNotifications?.errors.map((error, index) => (
													<div
														key={index}
														className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400"
													>
														Customer: {error}
													</div>
												))}
											</div>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Customer Contact */}
					{workflowRun && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="size-5 text-purple-600" />
									Customer Contact Details
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="flex items-center gap-2">
										<User className="size-4 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Name</p>
											<p className="font-medium">{workflowRun.customerName}</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Mail className="size-4 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Email</p>
											<p className="font-medium">{workflowRun.customerEmail}</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Phone className="size-4 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Phone</p>
											<p className="font-medium">{workflowRun.customerPhone}</p>
										</div>
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
