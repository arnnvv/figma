DO $$ BEGIN
 CREATE TYPE "public"."edit_access_status" AS ENUM('pending', 'accepted', 'declined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_edit_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"room_id_requested_for" varchar NOT NULL,
	"edit_access_status" "edit_access_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_email_verification_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_password_reset_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"two_factor_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_rooms" (
	"id" varchar PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "figma_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_edit_access" ADD CONSTRAINT "figma_edit_access_requester_id_figma_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_edit_access" ADD CONSTRAINT "figma_edit_access_room_id_requested_for_figma_rooms_id_fk" FOREIGN KEY ("room_id_requested_for") REFERENCES "public"."figma_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_email_verification_request" ADD CONSTRAINT "figma_email_verification_request_user_id_figma_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_password_reset_session" ADD CONSTRAINT "figma_password_reset_session_user_id_figma_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_rooms" ADD CONSTRAINT "figma_rooms_owner_id_figma_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_sessions" ADD CONSTRAINT "figma_sessions_user_id_figma_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
