import { CheckCircle, AlertCircle } from "lucide-react";
import { Suspense } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { PageHeader } from "./components/page-header";
import { QuoteDataProvider, QuoteDataLoading } from "./components/quote-data-provider";
import { QuoteList } from "./components/quote-list";
import { QuoteStatsLoading } from "./components/quote-stats";

interface QuoteSelectionPageProps {
	params: {
		quotesHash: string;
	};
}

const AlreadySelectedState = ({ alreadySelected }: { alreadySelected: any }) => {
	return (
		<div className="container mx-auto mt-4 max-w-2xl p-4 sm:mt-8 sm:py-8">
			<div className="text-center">
				<CheckCircle className="mx-auto size-12 text-green-600 sm:size-16" />
				<h1 className="mt-4 text-xl font-bold sm:text-2xl">Quote Already Selected</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					You have already selected a quote for this booking.
				</p>
				<div className="mt-6 rounded-lg border bg-card p-4">
					<h3 className="font-semibold">Selected Quote Details</h3>
					<div className="mt-2 space-y-1 text-sm text-muted-foreground">
						<p>Quote ID: {alreadySelected.quoteId.slice(0, 8)}</p>
						{alreadySelected.amount > 0 && <p>Amount: £{alreadySelected.amount}</p>}
						{alreadySelected.message && <p>Message: {alreadySelected.message}</p>}
					</div>
				</div>
			</div>
		</div>
	);
};

const EmptyQuotesState = () => {
	return (
		<div className="container mx-auto max-w-2xl p-4 sm:py-8">
			<Alert>
				<AlertCircle className="size-4" />
				<AlertDescription>No quotes available.</AlertDescription>
			</Alert>
		</div>
	);
};

const HeaderWithStats = async ({ quotesHash }: { quotesHash: string }) => {
	return (
		<QuoteDataProvider quotesHash={quotesHash}>
			{(quoteData) => <PageHeader quoteData={quoteData} />}
		</QuoteDataProvider>
	);
};

const QuoteContent = async ({ quotesHash }: { quotesHash: string }) => {
	return (
		<QuoteDataProvider quotesHash={quotesHash}>
			{(quoteData) => {
				if (quoteData.alreadySelected) {
					return <AlreadySelectedState alreadySelected={quoteData.alreadySelected} />;
				}

				if (quoteData.quotes.length === 0) {
					return <EmptyQuotesState />;
				}

				return <QuoteList quotes={quoteData.quotes} quotesHash={quotesHash} />;
			}}
		</QuoteDataProvider>
	);
};

const QuoteSelectionPage = ({ params }: QuoteSelectionPageProps) => {
	return (
		<div className="container mx-auto mt-4 p-4 sm:mt-8 sm:py-8">
			<Suspense
				fallback={
					<div className="mb-6 text-center sm:mb-8">
						<h1 className="text-2xl font-bold sm:text-3xl">Select Your Ride</h1>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							Choose from our recommended quotes for your journey
						</p>
						<QuoteStatsLoading />
					</div>
				}
			>
				<HeaderWithStats quotesHash={params.quotesHash} />
			</Suspense>

			<Suspense fallback={<QuoteDataLoading />}>
				<QuoteContent quotesHash={params.quotesHash} />
			</Suspense>
		</div>
	);
};

export default QuoteSelectionPage;
