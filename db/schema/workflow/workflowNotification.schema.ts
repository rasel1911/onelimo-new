import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";

import { workflowProvider } from "./workflowProvider.schema";
import { workflowRun } from "./workflowRun.schema";

export const workflowNotification = pgTable("WorkflowNotification", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	workflowRunId: varchar("workflow_run_id", { length: 255 })
		.notNull()
		.references(() => workflowRun.workflowRunId),
	workflowProviderId: uuid("workflow_provider_id").references(() => workflowProvider.id),

	// Notification details
	type: varchar("type", { length: 50 }).notNull(), // email, sms, push
	recipient: varchar("recipient", { length: 255 }).notNull(),

	// Status tracking
	status: varchar("status", { length: 50 }).notNull(), // sent, failed, bounced, delivered, opened, clicked

	// Message details
	subject: varchar("subject", { length: 255 }),
	messageId: varchar("message_id", { length: 255 }),
	templateUsed: varchar("template_used", { length: 100 }),

	// Timing
	sentAt: timestamp("sent_at"),
	deliveredAt: timestamp("delivered_at"),
	openedAt: timestamp("opened_at"),
	clickedAt: timestamp("clicked_at"),

	// Error handling
	errorCode: varchar("error_code", { length: 50 }),
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0),
	maxRetries: integer("max_retries").default(3),

	// Response tracking
	hasResponse: boolean("has_response").notNull().default(false),
	responseAt: timestamp("response_at"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkflowNotification = InferSelectModel<typeof workflowNotification>;
export type InsertWorkflowNotification = InferInsertModel<typeof workflowNotification>;
