DO $$ BEGIN
 CREATE TYPE "public"."edit_access_status" AS ENUM('pending', 'accepted', 'declined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "figma_editAccess" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"requester_id" varchar(21) NOT NULL,
	"room_id_requested_for" varchar(21) NOT NULL,
	"edit_access_status" "edit_access_status" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_editAccess" ADD CONSTRAINT "figma_editAccess_requester_id_figma_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_editAccess" ADD CONSTRAINT "figma_editAccess_room_id_requested_for_figma_rooms_id_fk" FOREIGN KEY ("room_id_requested_for") REFERENCES "public"."figma_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
