CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"county_code" text NOT NULL,
	"county_name" text NOT NULL,
	"constituency_code" text NOT NULL,
	"constituency_name" text NOT NULL,
	"ward_code" text NOT NULL,
	"ward_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"national_id_hash" text NOT NULL,
	"agent_code" text NOT NULL,
	"biometric_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agents_email_unique" UNIQUE("email"),
	CONSTRAINT "agents_agent_code_unique" UNIQUE("agent_code")
);
--> statement-breakpoint
CREATE TABLE "candidate_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_34a_id" uuid NOT NULL,
	"candidate_first_name" text NOT NULL,
	"candidate_last_name" text NOT NULL,
	"party_name" text NOT NULL,
	"votes" integer NOT NULL,
	"extracted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_34a_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_code" text NOT NULL,
	"form_image_url" text NOT NULL,
	"serial_number" text NOT NULL,
	"county_code" text NOT NULL,
	"constituency_code" text NOT NULL,
	"ward_code" text NOT NULL,
	"polling_station_code" text,
	"polling_station_name" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ocr_processed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_code" text NOT NULL,
	"video_url" text NOT NULL,
	"video_sequence" text NOT NULL,
	"video_name" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"location" text,
	"duration" integer,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polling_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"county_code" text NOT NULL,
	"county_name" text NOT NULL,
	"constituency_code" text NOT NULL,
	"constituency_name" text NOT NULL,
	"ward_code" text NOT NULL,
	"ward_name" text NOT NULL,
	"polling_station_code" text NOT NULL,
	"polling_station_name" text NOT NULL,
	"registered_voters" integer NOT NULL,
	CONSTRAINT "polling_stations_polling_station_code_unique" UNIQUE("polling_station_code")
);
--> statement-breakpoint
CREATE TABLE "serial_number_discrepancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_number" text NOT NULL,
	"county_code" text NOT NULL,
	"constituency_code" text NOT NULL,
	"ward_code" text NOT NULL,
	"discrepancy_type" text NOT NULL,
	"related_form_ids" text[],
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_results" ADD CONSTRAINT "candidate_results_form_34a_id_form_34a_submissions_id_fk" FOREIGN KEY ("form_34a_id") REFERENCES "public"."form_34a_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_34a_submissions" ADD CONSTRAINT "form_34a_submissions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_videos" ADD CONSTRAINT "incident_videos_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agents_user_id_idx" ON "agents" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_agent_code_idx" ON "agents" USING btree ("agent_code");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_email_idx" ON "agents" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_results_form_34a_id_idx" ON "candidate_results" USING btree ("form_34a_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_34a_submissions_agent_id_idx" ON "form_34a_submissions" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_34a_submissions_serial_number_idx" ON "form_34a_submissions" USING btree ("serial_number");--> statement-breakpoint
CREATE UNIQUE INDEX "form_34a_submissions_agent_code_idx" ON "form_34a_submissions" USING btree ("agent_code");--> statement-breakpoint
CREATE UNIQUE INDEX "incident_videos_agent_id_idx" ON "incident_videos" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "incident_videos_agent_code_idx" ON "incident_videos" USING btree ("agent_code");--> statement-breakpoint
CREATE UNIQUE INDEX "polling_stations_polling_station_code_idx" ON "polling_stations" USING btree ("polling_station_code");--> statement-breakpoint
CREATE UNIQUE INDEX "polling_stations_county_code_idx" ON "polling_stations" USING btree ("county_code");--> statement-breakpoint
CREATE UNIQUE INDEX "polling_stations_constituency_code_idx" ON "polling_stations" USING btree ("constituency_code");--> statement-breakpoint
CREATE UNIQUE INDEX "polling_stations_ward_code_idx" ON "polling_stations" USING btree ("ward_code");--> statement-breakpoint
CREATE UNIQUE INDEX "serial_number_discrepancies_serial_number_idx" ON "serial_number_discrepancies" USING btree ("serial_number");