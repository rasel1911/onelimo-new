import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";
import { ProvidersStepContentProps } from "@/lib/workflow/types/booking-tracker";

export function ProvidersStepContent({ step, onModalOpen }: ProvidersStepContentProps) {
	if (step.status === "pending" || !step.providers) {
		return null;
	}

	const respondedProviders = step.providers.filter((provider) => provider.hasResponded);
	const totalProviders = step.providers.length;

	return (
		<div className="mt-2 space-y-1">
			<p className="text-sm">
				{totalProviders} provider{totalProviders !== 1 ? "s" : ""} contacted
			</p>
			{respondedProviders.length > 0 && (
				<p className="text-xs text-muted-foreground">
					{respondedProviders.length} response{respondedProviders.length !== 1 ? "s" : ""} received
				</p>
			)}
			<Button
				variant="link"
				className="h-auto p-0 text-sm"
				onClick={() => onModalOpen(MODAL_TYPES.PROVIDERS, step.providers)}
			>
				View details <ChevronRight className="ml-1 size-3" />
			</Button>
		</div>
	);
}
