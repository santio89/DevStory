import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import type { DevStory } from "@/lib/devstory/story";

export type StoryRow = {
  id: string;
  username: string;
  title: string;
  summary: string;
  story: DevStory;
  mode: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getStory(id: string): Promise<StoryRow | null> {
  if (!hasDatabase() || !UUID_PATTERN.test(id)) return null;
  const db = getDb();
  const [row] = await db.select().from(stories).where(eq(stories.id, id));
  return row ?? null;
}