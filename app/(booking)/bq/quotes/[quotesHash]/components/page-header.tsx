import { Suspense } from "react";

import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { GeneratedQuoteLink } from "@/lib/workflow/types/quote-link";

import { QuoteStats, QuoteStatsLoading } from "./quote-stats";

interface QuoteData {
	quotes: WorkflowQuote[];
	linkData?: GeneratedQuoteLink;
}

export const PageHeader = ({ quoteData }: { quoteData: QuoteData }) => {
	return (
		<div className="mb-8 text-center">
			<h1 className="text-3xl font-bold">Select Your Ride</h1>
			<p className="mt-2 text-muted-foreground">
				Choose from our recommended quotes for your journey
			</p>
			<Suspense fallback={<QuoteStatsLoading />}>
				<QuoteStats quoteData={quoteData} />
			</Suspense>
		</div>
	);
};
