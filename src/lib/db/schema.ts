import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { Locale } from "@/lib/i18n/dictionary";

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubLogin: text("github_login").notNull(),
  username: text("username").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  story: jsonb("story").notNull().$type<DevStory>(),
  data: jsonb("data").$type<StoryDataSnapshot | null>(),
  mode: text("mode").notNull().default("ai"),
  authoredLocale: text("authored_locale").notNull().default("en").$type<Locale>(),
  translations: jsonb("translations")
    .notNull()
    .$type<Partial<Record<Locale, DevStory>>>()
    .default({}),
  emailSubject: text("email_subject"),
  emailPs: text("email_ps"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storyEmails = pgTable("story_emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});