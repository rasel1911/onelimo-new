import { CheckCircle2, ExternalLink, Calendar, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { type BookingStepProps } from "@/lib/workflow/types/booking-tracker";

interface CompleteStepContentProps
	extends Pick<BookingStepProps, "selectedBooking" | "onModalOpen"> {
	step: {
		name: string;
		status: string;
		details?: any;
		completedAt?: string;
		timestamp?: string;
	};
}

export function CompleteStepContent({
	step,
	selectedBooking,
	onModalOpen,
}: CompleteStepContentProps) {
	const workflowRun = selectedBooking.rawData?.workflowRun;
	const bookingRequest = selectedBooking.bookingRequest;

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-GB", {
			style: "currency",
			currency: "GBP",
		}).format(amount / 100);

	const formatDateTime = (date: string) => {
		return new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="mt-3 space-y-3">
			{step.status == "completed" && (
				<>
					<div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="size-4 text-teal-600" />
							<div className="flex-1">
								<p className="text-sm font-medium text-green-800 dark:text-teal-500">
									Booking Successfully Completed
								</p>
								<p className="text-xs text-green-700 dark:text-teal-600">
									All confirmations sent and workflow finished
								</p>
							</div>
						</div>
					</div>
					{/* Booking Summary */}
					{workflowRun && bookingRequest && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<div className="flex items-center gap-1">
									<Calendar className="size-3 text-muted-foreground" />
									<span className="text-muted-foreground">Completed at:</span>
								</div>
								<span className="font-medium">
									{formatDateTime(step.completedAt || step.timestamp || new Date().toISOString())}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Customer:</span>
								<span className="font-medium">
									{workflowRun.customerName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
								</span>
							</div>
						</div>
					)}

					<Button
						variant="outline"
						size="sm"
						className="w-full text-xs"
						onClick={() =>
							onModalOpen(MODAL_TYPES.COMPLETE, {
								workflowRun: selectedBooking.rawData?.workflowRun || null,
								bookingRequest: selectedBooking.bookingRequest || null,
								providerNotifications: step.details?.providerNotifications || null,
								customerNotifications: step.details?.customerNotifications || null,
								bookingId: selectedBooking.bookingRequest?.requestCode || selectedBooking.bookingId,
								completedAt: step.completedAt || step.timestamp || new Date().toISOString(),
							})
						}
					>
						<ExternalLink className="mr-1 size-3" />
						<span className="underline">View completion summary</span>
					</Button>
				</>
			)}
		</div>
	);
}
