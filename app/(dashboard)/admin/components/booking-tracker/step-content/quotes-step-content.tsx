import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { QuotesStepContentProps } from "@/lib/workflow/types/booking-tracker";

export function QuotesStepContent({ step, selectedBooking, onModalOpen }: QuotesStepContentProps) {
	if (!step.quotes || step.quotes.length === 0) {
		return null;
	}

	const acceptedQuotes = step.quotes.filter((q) => q.status === "accepted");

	return (
		<div className="mt-2">
			<p className="text-sm">{acceptedQuotes.length} quotes received</p>
			<Button
				variant="link"
				className="h-auto p-0 text-sm"
				onClick={() =>
					onModalOpen(MODAL_TYPES.QUOTES, {
						quotes: step.quotes || [],
						workflowRunId: selectedBooking.rawData?.workflowRun?.workflowRunId,
					})
				}
			>
				View quotes <ChevronRight className="ml-1 size-3" />
			</Button>
		</div>
	);
}
