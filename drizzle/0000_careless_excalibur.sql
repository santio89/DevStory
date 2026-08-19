CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_login" text NOT NULL,
	"username" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"story" jsonb NOT NULL,
	"mode" text DEFAULT 'ai' NOT NULL,
	"email_subject" text,
	"email_ps" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stories_github_login_unique" UNIQUE("github_login")
);
--> statement-breakpoint
CREATE TABLE "story_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "story_emails" ADD CONSTRAINT "story_emails_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;