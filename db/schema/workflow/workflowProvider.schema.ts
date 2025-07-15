import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	text,
	integer,
	boolean,
	jsonb,
	index,
} from "drizzle-orm/pg-core";

import { serviceProvider } from "../serviceProvider.schema";
import { workflowRun } from "./workflowRun.schema";

export const workflowProvider = pgTable(
	"WorkflowProvider",
	{
		id: uuid("id").primaryKey().notNull().defaultRandom(),
		workflowRunId: varchar("workflow_run_id", { length: 255 })
			.notNull()
			.references(() => workflowRun.workflowRunId),

		serviceProviderId: uuid("service_provider_id").references(() => serviceProvider.id),

		// Contact status: waiting, contacted, bounced, failed
		contactStatus: varchar("contact_status", { length: 50 }).notNull().default("waiting"),
		emailSent: timestamp("email_sent"),
		smsSent: timestamp("sms_sent"),

		// Response Status: accepted, declined, no_response, pending
		hasResponded: boolean("has_responded").notNull().default(false),
		responseStatus: varchar("response_status", { length: 50 }),
		responseTime: timestamp("response_time"),
		responseNotes: text("response_notes"),
		refinedResponse: text("refined_response"), // FIXME: This is not used

		// Quote tracking:
		hasQuoted: boolean("has_quoted").notNull().default(false),
		quoteAmount: integer("quote_amount"), // in cents
		quoteTime: timestamp("quote_time"),
		quoteNotes: text("quote_notes"),
		refinedQuote: text("refined_quote"), // FIXME: This is not used

		response: jsonb("response"),

		providerLinkHash: varchar("provider_link_hash", { length: 500 }),
		linkEncryptedData: text("provider_link_encrypted_data"),
		linkExpiresAt: timestamp("provider_link_expires_at"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => {
		return {
			workflowRunIdx: index("wp_workflow_run_idx").on(table.workflowRunId),
			serviceProviderIdx: index("wp_service_provider_idx").on(table.serviceProviderId),
			contactStatusIdx: index("wp_contact_status_idx").on(table.contactStatus),
			responseStatusIdx: index("wp_response_status_idx").on(table.responseStatus),
			hasRespondedIdx: index("wp_has_responded_idx").on(table.hasResponded),
			hasQuotedIdx: index("wp_has_quoted_idx").on(table.hasQuoted),
		};
	},
);

export type WorkflowProvider = InferSelectModel<typeof workflowProvider>;
export type InsertWorkflowProvider = InferInsertModel<typeof workflowProvider>;
