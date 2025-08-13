CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'service_provider', 'support');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'deleted');--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(64) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"messages" json NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"details" json NOT NULL,
	"hasCompletedPayment" boolean DEFAULT false NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(50) NOT NULL,
	"zipcodes" varchar(20)[] NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ServiceProvider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(64) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"locationId" uuid,
	"locationIds" uuid[],
	"serviceLocations" varchar(100)[],
	"serviceType" varchar(50)[],
	"areaCovered" varchar(100)[],
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"role" varchar(20) DEFAULT 'provider' NOT NULL,
	"reputation" integer DEFAULT 0,
	"responseTime" integer DEFAULT 0,
	"pinHash" varchar(255),
	"pinSalt" varchar(255),
	"pinSetAt" timestamp,
	"failedPinAttempts" integer DEFAULT 0,
	"lastFailedPinAttempt" timestamp,
	"isBlocked" varchar(10) DEFAULT 'false',
	"blockedAt" timestamp,
	"pinResetToken" varchar(255),
	"pinResetTokenExpiresAt" timestamp,
	"pinResetRequestedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ServiceProvider_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Communication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceProviderId" uuid NOT NULL,
	"subject" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BookingRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requestCode" varchar(20) NOT NULL,
	"userId" uuid NOT NULL,
	"customerName" varchar(100) NOT NULL,
	"pickupLocation" json NOT NULL,
	"dropoffLocation" json NOT NULL,
	"pickupTime" timestamp NOT NULL,
	"estimatedDropoffTime" timestamp NOT NULL,
	"estimatedDuration" integer NOT NULL,
	"passengers" integer NOT NULL,
	"vehicleType" varchar(80) NOT NULL,
	"specialRequests" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "BookingRequest_requestCode_unique" UNIQUE("requestCode")
);
--> statement-breakpoint
CREATE TABLE "RegistrationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(100) NOT NULL,
	"email" varchar(100),
	"isUsed" boolean DEFAULT false NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RegistrationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "PersistentRegistrationLink" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linkId" varchar(50) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PersistentRegistrationLink_linkId_unique" UNIQUE("linkId")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"data_type" text DEFAULT 'string' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WorkflowRun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" varchar(255) NOT NULL,
	"booking_request_id" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'analyzing' NOT NULL,
	"current_step" varchar(50) DEFAULT 'Request' NOT NULL,
	"current_step_number" integer DEFAULT 1 NOT NULL,
	"customer_name" varchar(255),
	"customer_email" varchar(255),
	"customer_phone" varchar(255),
	"booking_analysis" jsonb,
	"response_analysis" jsonb,
	"confirmation_analysis" jsonb,
	"providers_contacted" jsonb,
	"total_providers_contacted" integer DEFAULT 0,
	"total_quotes_received" integer DEFAULT 0,
	"selected_provider_id" varchar(255),
	"selected_quote_id" varchar(255),
	"selected_quote_amount" integer,
	"selected_quote_message" text,
	"selected_quote_action" varchar(255),
	"quotes_hash" varchar(255),
	"quotes_encrypted_data" text,
	"quotes_expires_at" timestamp,
	"quotes_viewed_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "WorkflowRun_workflow_run_id_unique" UNIQUE("workflow_run_id")
);
--> statement-breakpoint
CREATE TABLE "WorkflowStep" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" varchar(255) NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"details" jsonb,
	"original_message" text,
	"customer_contact" varchar(255),
	"enhanced_message" text,
	"email_status" varchar(50),
	"sms_status" varchar(50),
	"email_recipients" integer DEFAULT 0,
	"sms_recipients" integer DEFAULT 0,
	"failed_notifications" integer DEFAULT 0,
	"failure_reasons" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"wait_time" varchar(50),
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WorkflowProvider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" varchar(255) NOT NULL,
	"service_provider_id" uuid,
	"contact_status" varchar(50) DEFAULT 'waiting' NOT NULL,
	"email_sent" timestamp,
	"sms_sent" timestamp,
	"has_responded" boolean DEFAULT false NOT NULL,
	"response_status" varchar(50),
	"response_time" timestamp,
	"response_notes" text,
	"refined_response" text,
	"has_quoted" boolean DEFAULT false NOT NULL,
	"quote_amount" integer,
	"quote_time" timestamp,
	"quote_notes" text,
	"response" jsonb,
	"provider_link_hash" varchar(500),
	"provider_link_encrypted_data" text,
	"provider_link_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WorkflowQuote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" varchar(255) NOT NULL,
	"workflow_provider_id" uuid NOT NULL,
	"quote_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"provider_name" varchar(255) NOT NULL,
	"is_selected_by_user" boolean DEFAULT false,
	"selected_by_user_at" timestamp,
	"selected_by_user_message" text,
	"status" varchar(50) NOT NULL,
	"amount" integer,
	"estimated_time" varchar(50),
	"rating" numeric(5, 2),
	"response_time" timestamp NOT NULL,
	"notes" text,
	"reason" text,
	"is_selected_by_ai" boolean DEFAULT false NOT NULL,
	"selected_by_ai_at" timestamp,
	"valid_until" timestamp,
	"terms" text,
	"overall_score" numeric(5, 2),
	"viability_score" numeric(5, 2),
	"seriousness_score" numeric(5, 2),
	"professionalism_score" numeric(5, 2),
	"strengths" json,
	"concerns" json,
	"key_points" json,
	"analysis_notes" text,
	"is_recommended" boolean,
	"recommendation_reason" text,
	"analysis_type" varchar(50),
	"analysis_version" varchar(20),
	"analyzed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "WorkflowQuote_quote_id_unique" UNIQUE("quote_id")
);
--> statement-breakpoint
CREATE TABLE "WorkflowNotification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_run_id" varchar(255) NOT NULL,
	"workflow_provider_id" uuid,
	"type" varchar(50) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"subject" varchar(255),
	"message_id" varchar(255),
	"template_used" varchar(100),
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"error_code" varchar(50),
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"has_response" boolean DEFAULT false NOT NULL,
	"response_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_locationId_Location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_serviceProviderId_ServiceProvider_id_fk" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."ServiceProvider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflow_run_id_WorkflowRun_workflow_run_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."WorkflowRun"("workflow_run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowProvider" ADD CONSTRAINT "WorkflowProvider_workflow_run_id_WorkflowRun_workflow_run_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."WorkflowRun"("workflow_run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowProvider" ADD CONSTRAINT "WorkflowProvider_service_provider_id_ServiceProvider_id_fk" FOREIGN KEY ("service_provider_id") REFERENCES "public"."ServiceProvider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowQuote" ADD CONSTRAINT "WorkflowQuote_workflow_run_id_WorkflowRun_workflow_run_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."WorkflowRun"("workflow_run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowQuote" ADD CONSTRAINT "WorkflowQuote_workflow_provider_id_WorkflowProvider_id_fk" FOREIGN KEY ("workflow_provider_id") REFERENCES "public"."WorkflowProvider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowNotification" ADD CONSTRAINT "WorkflowNotification_workflow_run_id_WorkflowRun_workflow_run_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."WorkflowRun"("workflow_run_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkflowNotification" ADD CONSTRAINT "WorkflowNotification_workflow_provider_id_WorkflowProvider_id_fk" FOREIGN KEY ("workflow_provider_id") REFERENCES "public"."WorkflowProvider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sp_email_idx" ON "ServiceProvider" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sp_location_idx" ON "ServiceProvider" USING btree ("locationId");--> statement-breakpoint
CREATE INDEX "sp_locations_idx" ON "ServiceProvider" USING btree ("locationIds");--> statement-breakpoint
CREATE INDEX "sp_service_locations_idx" ON "ServiceProvider" USING btree ("serviceLocations");--> statement-breakpoint
CREATE INDEX "sp_status_idx" ON "ServiceProvider" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sp_role_idx" ON "ServiceProvider" USING btree ("role");--> statement-breakpoint
CREATE INDEX "sp_pin_reset_token_idx" ON "ServiceProvider" USING btree ("pinResetToken");--> statement-breakpoint
CREATE INDEX "sp_is_blocked_idx" ON "ServiceProvider" USING btree ("isBlocked");--> statement-breakpoint
CREATE INDEX "wp_workflow_run_idx" ON "WorkflowProvider" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "wp_service_provider_idx" ON "WorkflowProvider" USING btree ("service_provider_id");--> statement-breakpoint
CREATE INDEX "wp_contact_status_idx" ON "WorkflowProvider" USING btree ("contact_status");--> statement-breakpoint
CREATE INDEX "wp_response_status_idx" ON "WorkflowProvider" USING btree ("response_status");--> statement-breakpoint
CREATE INDEX "wp_has_responded_idx" ON "WorkflowProvider" USING btree ("has_responded");--> statement-breakpoint
CREATE INDEX "wp_has_quoted_idx" ON "WorkflowProvider" USING btree ("has_quoted");