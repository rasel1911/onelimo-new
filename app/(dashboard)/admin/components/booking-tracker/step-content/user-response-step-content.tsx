import { ChevronRight, Brain, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { NotificationStepContentProps } from "@/lib/workflow/types/booking-tracker";

export function UserResponseStepContent({ step, onModalOpen }: NotificationStepContentProps) {
	const isStepActive = step.status === "in-progress" || step.status === "completed";

	if (!isStepActive) {
		return null;
	}

	const confirmationAnalysis = step.details?.confirmationAnalysis;

	return (
		<div className="mt-2 space-y-2">
			{confirmationAnalysis && (
				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-md border p-2 text-sm">
						<div className="flex justify-between">
							<span>Intent:</span>
							<Badge
								variant={
									confirmationAnalysis.intent === "confirmation"
										? "default"
										: confirmationAnalysis.intent === "concern"
											? "destructive"
											: "outline"
								}
								className="text-xs"
							>
								{confirmationAnalysis.intent}
							</Badge>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{confirmationAnalysis.confidence}% confidence
						</p>
					</div>

					<div className="rounded-md border p-2 text-sm">
						<div className="flex justify-between">
							<span>Sentiment:</span>
							<Badge
								variant={
									confirmationAnalysis.sentiment === "positive"
										? "default"
										: confirmationAnalysis.sentiment === "negative"
											? "destructive"
											: "outline"
								}
								className="text-xs"
							>
								{confirmationAnalysis.sentiment}
							</Badge>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{confirmationAnalysis.urgency} urgency
						</p>
					</div>
				</div>
			)}

			{step.details?.selectedQuoteDetails && (
				<div className="rounded-md border bg-green-50 p-2 text-sm dark:bg-green-950/20">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="size-4 text-green-600" />
						<span className="font-medium">Quote Selected</span>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{step.details.provider?.name} - £{step.details.selectedQuoteDetails.amount}
					</p>
				</div>
			)}

			<Button
				variant="link"
				className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary"
				onClick={() => onModalOpen(MODAL_TYPES.USER_RESPONSE, step.details)}
			>
				<span className="underline">View response analysis</span>
				<ChevronRight className="ml-1 size-3" />
			</Button>
		</div>
	);
}
