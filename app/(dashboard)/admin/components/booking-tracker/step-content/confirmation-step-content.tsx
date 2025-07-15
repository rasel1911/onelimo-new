import { ChevronRight, Mail, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { type BookingStepProps } from "@/lib/workflow/types/booking-tracker";

interface ConfirmationStepContentProps
	extends Pick<BookingStepProps, "selectedBooking" | "onModalOpen"> {
	step: {
		name: string;
		status: string;
		details?: any;
		completedAt?: string;
		timestamp?: string;
	};
}

export function ConfirmationStepContent({
	step,
	selectedBooking,
	onModalOpen,
}: ConfirmationStepContentProps) {
	const isStepActive = step.status === "in-progress" || step.status === "completed";

	if (!isStepActive) {
		return null;
	}

	const providerNotificationResult = step.details?.providerNotifications;
	const customerNotificationResult = step.details?.customerNotifications;

	const getNotificationStatus = (result: any) => {
		if (!result) return "unknown";
		if (result.success && (!result.errors || result.errors.length === 0)) return "success";
		if (result.success && result.errors && result.errors.length > 0) return "partial";
		return "failed";
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <CheckCircle2 className="size-4 text-green-600" />;
			case "partial":
			case "failed":
				return <AlertTriangle className="size-4 text-red-600" />;
			default:
				return <Mail className="size-4 text-gray-600" />;
		}
	};

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "success":
				return "default";
			case "partial":
				return "secondary";
			case "failed":
				return "destructive";
			default:
				return "outline";
		}
	};

	return (
		<div className="mt-2 space-y-2">
			{/* Notification Status Grid */}
			<div className="grid grid-cols-2 gap-2">
				<div className="rounded-md border p-2 text-sm">
					<div className="flex justify-between">
						<span>Provider:</span>
						<Badge
							variant={getStatusVariant(getNotificationStatus(providerNotificationResult))}
							className="text-xs"
						>
							{getNotificationStatus(providerNotificationResult)}
						</Badge>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{providerNotificationResult?.resultsCount ||
							providerNotificationResult?.results?.length ||
							0}{" "}
						notifications sent
					</p>
					{providerNotificationResult?.errors?.length > 0 && (
						<p className="mt-1 text-xs text-red-600">
							{providerNotificationResult.errors.length} error(s)
						</p>
					)}
				</div>

				<div className="rounded-md border p-2 text-sm">
					<div className="flex justify-between">
						<span>Customer:</span>
						<Badge
							variant={getStatusVariant(getNotificationStatus(customerNotificationResult))}
							className="text-xs"
						>
							{getNotificationStatus(customerNotificationResult)}
						</Badge>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{customerNotificationResult?.resultsCount ||
							customerNotificationResult?.results?.length ||
							0}{" "}
						notifications sent
					</p>
					{customerNotificationResult?.errors?.length > 0 && (
						<p className="mt-1 text-xs text-red-600">
							{customerNotificationResult.errors.length} error(s)
						</p>
					)}
				</div>
			</div>

			{/* Booking confirmed summary */}
			{step.details?.provider && step.details?.selectedQuoteDetails && (
				<div className="rounded-md border bg-green-50 p-2 text-sm dark:bg-green-950/20">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="size-4 text-green-600" />
						<span className="font-medium">Booking Confirmed</span>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{step.details.provider.name} - £
						{((step.details.selectedQuoteDetails.amount || 0) / 100).toFixed(2)}
					</p>
				</div>
			)}

			<Button
				variant="link"
				className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
				onClick={() =>
					onModalOpen(MODAL_TYPES.CONFIRMATION, {
						providerNotificationResult: step.details?.providerNotifications || null,
						customerNotificationResult: step.details?.customerNotifications || null,
						provider: step.details?.provider || null,
						selectedQuoteDetails: step.details?.selectedQuoteDetails || null,
						bookingId: selectedBooking.bookingRequest?.requestCode || selectedBooking.bookingId,
						urgent: step.details?.urgent || false,
					})
				}
			>
				<span className="underline">View confirmation details</span>
				<ChevronRight className="ml-1 size-3" />
			</Button>
		</div>
	);
}
