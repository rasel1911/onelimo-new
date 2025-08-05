"use client";

import { useState } from "react";

import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";

import { QuoteCard } from "./quote-card";
import { QuoteSelectionModal } from "./quote-selection-modal";

interface QuoteListProps {
	quotes: WorkflowQuote[];
	quotesHash: string;
	onQuoteConfirmed?: () => void;
}

export const QuoteList = ({ quotes, quotesHash, onQuoteConfirmed }: QuoteListProps) => {
	const [selectedQuote, setSelectedQuote] = useState<WorkflowQuote | null>(null);
	const [showModal, setShowModal] = useState(false);

	const handleQuoteSelect = (quote: WorkflowQuote) => {
		setSelectedQuote(quote);
		setShowModal(true);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setSelectedQuote(null);
	};

	const handleQuoteConfirmed = () => {
		onQuoteConfirmed?.();
	};

	return (
		<>
			<div className="mx-auto max-w-2xl space-y-6">
				{quotes.map((quote) => (
					<QuoteCard key={quote.id.slice(0, 7)} quote={quote} onSelect={handleQuoteSelect} />
				))}
			</div>

			<QuoteSelectionModal
				quote={selectedQuote}
				isOpen={showModal}
				onClose={handleModalClose}
				onConfirm={handleQuoteConfirmed}
				quotesHash={quotesHash}
			/>
		</>
	);
};
