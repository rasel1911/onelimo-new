import { NextRequest, NextResponse } from "next/server";

import { getWorkflowQuoteAnalysis } from "@/db/queries/workflow/workflowQuote.queries";

export async function GET(request: NextRequest, { params }: { params: { workflowRunId: string } }) {
	try {
		const { workflowRunId } = params;

		if (!workflowRunId) {
			return NextResponse.json({ error: "Workflow run ID is required" }, { status: 400 });
		}

		const quoteAnalysisData = await getWorkflowQuoteAnalysis(workflowRunId);

		return NextResponse.json(quoteAnalysisData);
	} catch (error) {
		console.error("❌ Failed to fetch workflow quote analysis:", error);
		return NextResponse.json({ error: "Failed to fetch quote analysis" }, { status: 500 });
	}
}
