import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	text,
	numeric,
	integer,
	boolean,
	json,
} from "drizzle-orm/pg-core";

import { workflowProvider } from "./workflowProvider.schema";
import { workflowRun } from "./workflowRun.schema";

export const workflowQuote = pgTable("WorkflowQuote", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	workflowRunId: varchar("workflow_run_id", { length: 255 })
		.notNull()
		.references(() => workflowRun.workflowRunId),
	workflowProviderId: uuid("workflow_provider_id")
		.notNull()
		.references(() => workflowProvider.id),

	quoteId: varchar("quote_id", { length: 255 }).notNull().unique(),

	providerId: varchar("provider_id", { length: 255 }).notNull(),
	providerName: varchar("provider_name", { length: 255 }).notNull(),

	isSelectedByUser: boolean("is_selected_by_user").default(false),
	selectedByUserAt: timestamp("selected_by_user_at"),
	selectedByUserMessage: text("selected_by_user_message"),

	status: varchar("status", { length: 50 }).notNull(),
	amount: integer("amount"),
	estimatedTime: varchar("estimated_time", { length: 50 }),
	rating: numeric("rating", { precision: 5, scale: 2 }),

	responseTime: timestamp("response_time").notNull(),
	notes: text("notes"),
	reason: text("reason"),

	isSelectedByAi: boolean("is_selected_by_ai").notNull().default(false),
	selectedByAiAt: timestamp("selected_by_ai_at"),

	validUntil: timestamp("valid_until"),
	terms: text("terms"),

	overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
	viabilityScore: numeric("viability_score", { precision: 5, scale: 2 }),
	seriousnessScore: numeric("seriousness_score", { precision: 5, scale: 2 }),
	professionalismScore: numeric("professionalism_score", { precision: 5, scale: 2 }),

	strengths: json("strengths").$type<string[]>(),
	concerns: json("concerns").$type<string[]>(),
	keyPoints: json("key_points").$type<string[]>(),
	analysisNotes: text("analysis_notes"),

	isRecommended: boolean("is_recommended"),
	recommendationReason: text("recommendation_reason"),

	analysisType: varchar("analysis_type", { length: 50 }),
	analysisVersion: varchar("analysis_version", { length: 20 }),
	analyzedAt: timestamp("analyzed_at"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkflowQuote = InferSelectModel<typeof workflowQuote>;
export type InsertWorkflowQuote = InferInsertModel<typeof workflowQuote>;

export interface QuoteAnalysisData {
	overallScore: number;
	viabilityScore: number;
	seriousnessScore: number;
	professionalismScore: number;
	strengths: string[];
	concerns: string[];
	keyPoints: string[];
	analysisNotes: string;
	isRecommended: boolean;
	recommendationReason: string;
	analysisType: "ai" | "fallback";
	analysisVersion: string;
}
