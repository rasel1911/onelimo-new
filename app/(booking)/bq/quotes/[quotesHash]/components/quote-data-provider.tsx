import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { ResponseAnalysisResult } from "@/lib/ai/services/responseAnalyzer";
import { GeneratedQuoteLink } from "@/lib/workflow/types/quote-link";

interface QuoteData {
	quotes: WorkflowQuote[];
	analysisOverview: ResponseAnalysisResult;
	selectedQuotes: WorkflowQuote[];
	analysisConfidence: number;
	linkData?: GeneratedQuoteLink;
	alreadySelected?: {
		quoteId: string;
		providerId: string;
		amount: number;
		message: string;
	} | null;
}

interface QuoteDataProviderProps {
	quotesHash: string;
	children: (data: QuoteData) => React.ReactNode;
}

const fetchQuoteData = async (quotesHash: string): Promise<QuoteData> => {
	const response = await fetch(`/api/bq/quotes/${quotesHash}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || "Failed to load quotes");
	}

	const data: QuoteData = await response.json();
	return {
		...data,
		quotes: data.quotes,
	};
};

export const QuoteDataProvider = async ({ quotesHash, children }: QuoteDataProviderProps) => {
	const quoteData = await fetchQuoteData(quotesHash);
	return <>{children(quoteData)}</>;
};

export const QuoteDataLoading = () => {
	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="rounded-lg border bg-card p-6">
						<div className="flex items-center justify-between pb-4">
							<div className="h-6 w-48 rounded bg-muted"></div>
							<div className="h-8 w-20 rounded bg-muted"></div>
						</div>
						<div className="mb-4 h-4 w-32 rounded bg-muted"></div>
						<div className="space-y-4">
							<div className="rounded-lg border-l-4 border-primary bg-primary/10 p-4">
								<div className="mb-2 h-4 w-16 rounded bg-primary/20"></div>
								<div className="h-4 w-full rounded bg-primary/20"></div>
								<div className="mt-2 h-4 w-3/4 rounded bg-primary/20"></div>
							</div>
							<div className="space-y-2">
								<div className="h-4 w-20 rounded bg-muted"></div>
								<div className="flex flex-wrap gap-2">
									{Array.from({ length: 4 }).map((_, j) => (
										<div key={j} className="h-6 w-24 rounded bg-muted"></div>
									))}
								</div>
							</div>
							<div className="h-12 w-full rounded bg-primary/20"></div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export const QuoteDataError = ({ error }: { error: Error }) => {
	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="rounded-lg border border-red-200 bg-red-50 p-4">
				<h3 className="text-lg font-semibold text-red-800">Failed to load quotes</h3>
				<p className="mt-2 text-sm text-red-700">
					{error.message || "Something went wrong while loading your quotes. Please try again."}
				</p>
			</div>
		</div>
	);
};
