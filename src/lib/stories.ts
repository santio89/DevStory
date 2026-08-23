import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";

export type StoryRow = {
  id: string;
  githubLogin: string;
  username: string;
  title: string;
  summary: string;
  story: DevStory;
  data: StoryDataSnapshot | null;
  mode: string;
  authoredLocale: Locale;
  translations: Partial<Record<Locale, DevStory>>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function storyForLocale(
  row: Pick<StoryRow, "story" | "authoredLocale" | "translations">,
  locale: Locale,
): DevStory {
  if (locale === row.authoredLocale) return row.story;
  return row.translations[locale] ?? row.story;
}

export async function getStory(id: string): Promise<StoryRow | null> {
  if (!hasDatabase() || !UUID_PATTERN.test(id)) return null;
  const db = getDb();
  const [row] = await db.select().from(stories).where(eq(stories.id, id));
  if (!row) return null;
  return {
    id: row.id,
    githubLogin: row.githubLogin,
    username: row.username,
    title: row.title,
    summary: row.summary,
    story: row.story,
    data: row.data ?? null,
    mode: row.mode,
    authoredLocale: (row.authoredLocale as Locale) ?? "en",
    translations: row.translations ?? {},
  };
}

export async function saveStory({
  githubLogin,
  username,
  story,
  data,
  mode,
  authoredLocale,
}: {
  githubLogin: string;
  username: string;
  story: DevStory;
  data: StoryDataSnapshot | null;
  mode: "ai" | "mock";
  authoredLocale: Locale;
}): Promise<string | null> {
  if (!hasDatabase()) return null;
  const db = getDb();
  const [row] = await db
    .insert(stories)
    .values({
      githubLogin,
      username,
      title: story.title,
      summary: story.summary,
      story,
      data,
      mode,
      authoredLocale,
      translations: {},
    })
    .returning({ id: stories.id });
  return row?.id ?? null;
}

export async function saveStoryTranslation({
  id,
  locale,
  story,
  authoredLocale,
}: {
  id: string;
  locale: Locale;
  story: DevStory;
  authoredLocale: Locale;
}): Promise<void> {
  if (!hasDatabase() || !UUID_PATTERN.test(id)) return;
  if (locale === authoredLocale) return;

  const existing = await getStory(id);
  if (!existing) return;

  const translations = { ...existing.translations, [locale]: story };
  const db = getDb();
  await db
    .update(stories)
    .set({
      translations,
      updatedAt: new Date(),
    })
    .where(eq(stories.id, id));
}
