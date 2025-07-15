import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text, jsonb, integer } from "drizzle-orm/pg-core";

import { workflowRun } from "./workflowRun.schema";

export const workflowStep = pgTable("WorkflowStep", {
	id: uuid("id").primaryKey().notNull().defaultRandom(),
	workflowRunId: varchar("workflow_run_id", { length: 255 })
		.notNull()
		.references(() => workflowRun.workflowRunId),

	// Step identification
	stepNumber: integer("step_number").notNull(),
	stepName: varchar("step_name", { length: 50 }).notNull(), // Request, Message, Notification, Providers, Quotes, User Response, Confirmation, Complete

	// Step status
	status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in-progress, completed, failed

	// Step details - flexible JSON storage for different step types
	details: jsonb("details"), // Step-specific data

	// Request step details
	originalMessage: text("original_message"),
	customerContact: varchar("customer_contact", { length: 255 }),

	// Message step details
	enhancedMessage: text("enhanced_message"),

	// Notification step details
	emailStatus: varchar("email_status", { length: 50 }), // sent, failed, partial
	smsStatus: varchar("sms_status", { length: 50 }), // sent, failed, partial
	emailRecipients: integer("email_recipients").default(0),
	smsRecipients: integer("sms_recipients").default(0),
	failedNotifications: integer("failed_notifications").default(0),
	failureReasons: jsonb("failure_reasons"),

	// Timing
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	waitTime: varchar("wait_time", { length: 50 }), // e.g., "25 minutes remaining"

	// Error handling
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkflowStep = InferSelectModel<typeof workflowStep>;
export type InsertWorkflowStep = InferInsertModel<typeof workflowStep>;
