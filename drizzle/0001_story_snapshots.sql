ALTER TABLE "stories" DROP CONSTRAINT IF EXISTS "stories_github_login_unique";
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "data" jsonb;
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "authored_locale" text DEFAULT 'en' NOT NULL;
