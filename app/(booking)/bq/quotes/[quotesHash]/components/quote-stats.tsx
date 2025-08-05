import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { GeneratedQuoteLink } from "@/lib/workflow/types/quote-link";

interface QuoteData {
	quotes: WorkflowQuote[];
	linkData?: GeneratedQuoteLink;
}

interface QuoteStatsProps {
	quoteData: QuoteData;
}

export const QuoteStats = ({ quoteData }: QuoteStatsProps) => {
	return (
		<div className="mt-2 text-sm font-medium text-muted-foreground">
			<div className="flex items-center justify-center gap-1">
				<span>
					{quoteData.quotes.length} quote{quoteData.quotes.length !== 1 ? "s" : ""} available
				</span>
				{quoteData.linkData?.expiresAt && (
					<>
						<span>•</span>
						<span className="text-xs text-orange-600">
							Expires at {new Date(quoteData.linkData.expiresAt).toLocaleString()}
						</span>
					</>
				)}
			</div>
		</div>
	);
};

export const QuoteStatsLoading = () => {
	return (
		<div className="mt-2 text-sm font-medium text-muted-foreground">
			<div className="flex items-center justify-center gap-1">
				<Skeleton className="h-4 w-24" />
				<span>•</span>
				<Skeleton className="h-4 w-52" />
			</div>
		</div>
	);
};
