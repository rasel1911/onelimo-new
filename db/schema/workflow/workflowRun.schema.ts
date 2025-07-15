import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, jsonb, integer } from "drizzle-orm/pg-core";

import { user } from "../user.schema";

export const workflowRun = pgTable("WorkflowRun", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	workflowRunId: varchar("workflow_run_id", { length: 255 }).notNull().unique(),
	bookingRequestId: varchar("booking_request_id", { length: 255 }).notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),

	status: varchar("status", { length: 50 }).notNull().default("analyzing"),
	currentStep: varchar("current_step", { length: 50 }).notNull().default("Request"),
	currentStepNumber: integer("current_step_number").notNull().default(1),

	customerName: varchar("customer_name", { length: 255 }),
	customerEmail: varchar("customer_email", { length: 255 }),
	customerPhone: varchar("customer_phone", { length: 255 }),

	bookingAnalysis: jsonb("booking_analysis"),
	responseAnalysis: jsonb("response_analysis").$type<QuoteAnalysis>(),
	confirmationAnalysis: jsonb("confirmation_analysis").$type<ConfirmationAnalysis>(),

	providersContacted: jsonb("providers_contacted"),
	totalProvidersContacted: integer("total_providers_contacted").default(0),
	totalQuotesReceived: integer("total_quotes_received").default(0),

	selectedProviderId: varchar("selected_provider_id", { length: 255 }),
	selectedQuoteId: varchar("selected_quote_id", { length: 255 }),
	selectedQuoteAmount: integer("selected_quote_amount"),
	selectedQuoteMessage: text("selected_quote_message"),
	selectedQuoteAction: varchar("selected_quote_action", { length: 255 }), // confirm, question

	quotesHash: varchar("quotes_hash", { length: 255 }),
	quotesEncryptedData: text("quotes_encrypted_data"),
	quotesExpiresAt: timestamp("quotes_expires_at"),
	quotesViewedAt: timestamp("quotes_viewed_at"),

	startedAt: timestamp("started_at").notNull().defaultNow(),
	completedAt: timestamp("completed_at"),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkflowRun = InferSelectModel<typeof workflowRun>;
export type InsertWorkflowRun = InferInsertModel<typeof workflowRun>;

export interface QuoteAnalysis {
	totalQuotes: number;
	acceptedQuotes: number;
	declinedQuotes: number;
	averageViability: number;
	averageSeriousness: number;
	averageProfessionalism: number;
	marketOverview: {
		competitionLevel: string;
		responseQuality: string;
		priceRange: {
			min: number;
			max: number;
			average: number;
		};
	};
	averageScore: number;
	marketInsights: string[];
	selectionStrategy: string;
	confidenceLevel: number;
}

export interface ConfirmationAnalysis {
	intent: "confirm" | "question" | "concern" | "cancellation" | "other";
	confidence: number;
	originalMessage: string;
	refinedMessage: string;
	keyPoints: string[];
	contactInfo?: {
		email?: string;
		phone?: string;
		name?: string;
	};
	urgency: "low" | "medium" | "high";
	requiresResponse: boolean;
	sentiment: "positive" | "neutral" | "negative";
	analyzedAt: Date;
}
