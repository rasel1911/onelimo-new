import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import {
	InsertWorkflowQuote,
	WorkflowQuote,
	workflowQuote,
} from "@/db/schema/workflow/workflowQuote.schema";
import { workflowRun, QuoteAnalysis } from "@/db/schema/workflow/workflowRun.schema";
import { ResponseAnalysisResult } from "@/lib/ai/services/responseAnalyzer/types";

/**
 * Create multiple workflow quotes from analysis results
 * @param workflowRunId - The ID of the workflow run to create the quotes for
 * @param analysisResults - The analysis results to create the quotes from
 * @param selectedQuoteIds - The IDs of the quotes to select
 * @param analysisType - The type of analysis to create the quotes from
 * @param analysisVersion - The version of the analysis to create the quotes from
 * @returns The created workflow quotes
 */
export const createWorkflowQuotesFromAnalysis = async (
	workflowRunId: string,
	analysisResults: ResponseAnalysisResult[],
	selectedQuoteIds: string[],
	analysisType: "ai" | "fallback" = "ai",
	analysisVersion: string = "1.0.0",
): Promise<WorkflowQuote[]> => {
	if (analysisResults.length === 0) {
		return [];
	}

	const quotesToInsert: InsertWorkflowQuote[] = analysisResults.map((analysis) => {
		const isSelectedByAi = selectedQuoteIds.includes(analysis.id);

		return {
			workflowRunId,
			workflowProviderId: analysis.workflowProviderId,
			quoteId: analysis.id,
			providerId: analysis.providerId,
			providerName: analysis.providerName,

			status: analysis.reason ? "declined" : "accepted",
			amount: analysis.quoteAmount,
			rating: analysis.overallScore.toString(),
			responseTime: new Date(),
			notes: analysis.responseNote,
			reason: analysis.reason || null,

			isSelectedByAi,
			selectedByAiAt: isSelectedByAi ? analysis.analyzedAt : null,

			overallScore: analysis.overallScore.toString(),
			viabilityScore: analysis.viabilityScore.toString(),
			seriousnessScore: analysis.seriousnessScore.toString(),
			professionalismScore: analysis.professionalismScore.toString(),

			strengths: analysis.strengths,
			concerns: analysis.concerns,
			keyPoints: analysis.keyPoints,
			analysisNotes: analysis.analysisNotes,

			isRecommended: analysis.isRecommended,
			recommendationReason: analysis.recommendationReason,

			analysisType,
			analysisVersion,
			analyzedAt: analysis.analyzedAt,

			createdAt: new Date(),
			updatedAt: new Date(),
		};
	});

	try {
		const insertedQuotes = await db.insert(workflowQuote).values(quotesToInsert).returning();
		return insertedQuotes;
	} catch (error) {
		console.error("❌ Failed to create workflow quotes from analysis:", error);
		return [];
	}
};

/**
 * Update workflow quote selection by user
 * @param workflowRunId - The ID of the workflow run to update the quote for
 * @param quoteId - The ID of the quote to update
 * @param isSelected - Whether the quote is selected
 * @returns The updated workflow quote
 */
export const updateWorkflowQuoteUserSelection = async (
	workflowRunId: string,
	providerId: string,
	quoteId: string,
	isSelected: boolean,
): Promise<WorkflowQuote | null> => {
	try {
		const [updatedQuote] = await db
			.update(workflowQuote)
			.set({
				isSelectedByUser: isSelected,
				selectedByUserAt: isSelected ? new Date() : null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(workflowQuote.workflowRunId, workflowRunId),
					eq(workflowQuote.quoteId, quoteId),
					eq(workflowQuote.providerId, providerId),
				),
			)
			.returning();

		if (!updatedQuote) {
			console.warn(
				`⚠️ No workflow quote found for update: ${quoteId} in workflow ${workflowRunId}`,
			);
			return null;
		}

		console.log(`✅ Updated user selection for quote ${quoteId}: ${isSelected}`);
		return updatedQuote;
	} catch (error) {
		console.error("❌ Failed to update workflow quote user selection:", error);
		throw new Error(
			`Failed to update quote selection: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};

/**
 * Get complete quote analysis data for a workflow run using existing responseAnalysis
 * @param workflowRunId - The ID of the workflow run to get analysis for
 * @returns The complete quote analysis including quotes and existing overview from workflowRun
 */
export const getWorkflowQuoteAnalysis = async (workflowRunId: string) => {
	try {
		const result = await db
			.select({
				quote: workflowQuote,
				workflowRun: workflowRun,
			})
			.from(workflowQuote)
			.innerJoin(workflowRun, eq(workflowQuote.workflowRunId, workflowRun.workflowRunId))
			.where(eq(workflowQuote.workflowRunId, workflowRunId))
			.orderBy(desc(workflowQuote.overallScore), desc(workflowQuote.createdAt));

		if (result.length === 0) {
			return {
				quotes: [],
				analysisOverview: {
					totalQuotes: 0,
					acceptedQuotes: 0,
					declinedQuotes: 0,
					recommendedQuotes: 0,
					averageScore: 0,
					averageViability: 0,
					averageSeriousness: 0,
					averageProfessionalism: 0,
					priceRange: { min: 0, max: 0, average: 0 },
					competitionLevel: "low" as const,
					responseQuality: "poor" as const,
					marketInsights: [],
					selectionStrategy: "",
				},
				selectedQuotes: [],
				analysisConfidence: 0,
			};
		}

		const quotes = result.map((r) => r.quote);
		const workflowData = result[0].workflowRun;
		const responseAnalysis = workflowData.responseAnalysis as QuoteAnalysis | null;

		const selectedQuotes = quotes.filter((q) => q.isSelectedByAi);
		const recommendedQuotes = quotes.filter((q) => q.isRecommended).length;

		const analysisOverview = responseAnalysis
			? {
					...responseAnalysis,
					recommendedQuotes,
				}
			: {
					totalQuotes: quotes.length,
					acceptedQuotes: quotes.filter((q) => q.status === "accepted").length,
					declinedQuotes: quotes.filter((q) => q.status === "declined").length,
					recommendedQuotes,
					averageScore: 0,
					averageViability: 0,
					averageSeriousness: 0,
					averageProfessionalism: 0,
					priceRange: { min: 0, max: 0, average: 0 },
					competitionLevel: "low" as const,
					responseQuality: "poor" as const,
					marketInsights: [],
					selectionStrategy: "",
				};

		return {
			quotes,
			analysisOverview,
			selectedQuotes,
			analysisConfidence: responseAnalysis?.confidenceLevel || 60,
		};
	} catch (error) {
		console.error("❌ Failed to get workflow quote analysis:", error);
		throw new Error(
			`Failed to get workflow quote analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};
