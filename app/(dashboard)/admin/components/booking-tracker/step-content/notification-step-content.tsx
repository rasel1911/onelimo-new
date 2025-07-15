import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { NotificationStepContentProps } from "@/lib/workflow/types/booking-tracker";

export function NotificationStepContent({ step, onModalOpen }: NotificationStepContentProps) {
	const isStepActive = step.status === "in-progress" || step.status === "completed";
	const isStepCompleted = step.status !== "pending";

	if (!isStepActive) {
		return null;
	}

	return (
		<div className="mt-2 space-y-2">
			{/* Email/SMS Status Grid */}
			<div className="grid grid-cols-2 gap-2">
				<div className="rounded-md border p-2 text-sm">
					<div className="flex justify-between">
						<span>Email Status:</span>
						<Badge
							variant={
								step.details?.notificationSummary?.email?.status === "sent"
									? "default"
									: "destructive"
							}
							className="text-xs"
						>
							{step.details?.notificationSummary?.email?.status || "sending"}
						</Badge>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Sent to {step.details?.notificationSummary?.email?.sent || 0} providers
					</p>
					{step.details?.notificationSummary?.email?.failed > 0 ? (
						<p className="mt-1 text-xs text-red-600">
							{step.details?.notificationSummary?.email?.failed} failed
						</p>
					) : step.details?.notificationSummary?.email?.sent > 0 &&
					  step.details?.notificationSummary?.email?.sent ===
							step.details?.notificationSummary?.email?.total ? (
						<p className="mt-1 text-xs text-teal-500">All sent</p>
					) : (
						""
					)}
				</div>

				<div className="rounded-md border p-2 text-sm">
					<div className="flex justify-between">
						<span>SMS Status:</span>
						<Badge
							variant={
								step.details?.notificationSummary?.sms?.status === "sent" ? "default" : "outline"
							}
							className="text-xs"
						>
							{step.details?.notificationSummary?.sms?.status || "sending"}
						</Badge>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Sent to {step.details?.notificationSummary?.sms?.sent || 0} providers
					</p>
					{step.details?.notificationSummary?.sms?.failed > 0 ? (
						<p className="mt-1 text-xs text-red-600">
							{step.details?.notificationSummary?.sms?.failed} failed
						</p>
					) : step.details?.notificationSummary?.sms?.sent > 0 &&
					  step.details?.notificationSummary?.sms?.sent ===
							step.details?.notificationSummary?.sms?.total ? (
						<p className="mt-1 text-xs text-teal-500">All sent</p>
					) : (
						""
					)}
				</div>
			</div>

			{/* Provider Summary Link */}
			{isStepCompleted && step.details?.notificationSummary?.totalProviders > 0 && (
				<Button
					variant="link"
					className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
					onClick={() => onModalOpen(MODAL_TYPES.NOTIFICATION, step.details)}
				>
					<span className="underline">
						Contacted {step.details?.notificationSummary?.totalProviders}{" "}
						{step.details?.notificationSummary?.totalProviders === 1 ? "provider" : "providers"}
					</span>
					<ChevronRight className="ml-1 size-3" />
				</Button>
			)}
		</div>
	);
}
