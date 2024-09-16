CREATE TABLE IF NOT EXISTS "figma_rooms" (
	"id" varchar PRIMARY KEY NOT NULL,
	"owner_id" varchar(21) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "figma_rooms" ADD CONSTRAINT "figma_rooms_owner_id_figma_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."figma_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
