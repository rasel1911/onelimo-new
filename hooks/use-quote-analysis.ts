import { useCallback, useState } from "react";

import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";

interface QuoteAnalysisOverview {
	totalQuotes: number;
	acceptedQuotes: number;
	declinedQuotes: number;
	recommendedQuotes: number;
	averageScore: number;
	averageViability: number;
	averageSeriousness: number;
	averageProfessionalism: number;
	priceRange: {
		min: number;
		max: number;
		average: number;
	};
	competitionLevel: "low" | "moderate" | "high";
	responseQuality: "poor" | "fair" | "good" | "excellent";
	marketInsights: string[];
	selectionStrategy: string;
}

interface QuoteAnalysisData {
	quotes: WorkflowQuote[];
	analysisOverview: QuoteAnalysisOverview;
	selectedQuotes: WorkflowQuote[];
	analysisConfidence: number;
}

interface UseQuoteAnalysisState {
	data: QuoteAnalysisData | null;
	isLoading: boolean;
	error: string | null;
}

export function useQuoteAnalysis() {
	const [state, setState] = useState<UseQuoteAnalysisState>({
		data: null,
		isLoading: false,
		error: null,
	});

	const fetchQuoteAnalysis = useCallback(async (workflowRunId: string) => {
		if (!workflowRunId) {
			setState((prev) => ({ ...prev, error: "Workflow run ID is required" }));
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const response = await fetch(`/api/workflow/${workflowRunId}/quotes`);

			if (!response.ok) {
				throw new Error(`Failed to fetch quote analysis: ${response.statusText}`);
			}

			const data: QuoteAnalysisData = await response.json();

			setState({
				data,
				isLoading: false,
				error: null,
			});
		} catch (error) {
			setState({
				data: null,
				isLoading: false,
				error: error instanceof Error ? error.message : "Failed to fetch quote analysis",
			});
		}
	}, []);

	const clearData = useCallback(() => {
		setState({
			data: null,
			isLoading: false,
			error: null,
		});
	}, []);

	return {
		...state,
		fetchQuoteAnalysis,
		clearData,
	};
}
