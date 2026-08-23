import { NextResponse } from "next/server";
import { z } from "zod";
import {
  translateStory,
  validateStory,
  storyFingerprint,
} from "@/lib/devstory/translate";
import { aiCacheKey, readAiCache, writeAiCache } from "@/lib/devstory/ai-cache";
import type { DevStory } from "@/lib/devstory/story";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";
import { getStory, saveStoryTranslation } from "@/lib/stories";

export const maxDuration = 60;

const bodySchema = z.object({
  story: z.unknown(),
  sourceLocale: z.string().optional(),
  targetLocale: z.string().optional(),
  storyId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const story = validateStory(parsed.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const sourceLocale: Locale = isLocale(parsed.sourceLocale)
    ? parsed.sourceLocale
    : "en";
  const targetLocale: Locale = isLocale(parsed.targetLocale)
    ? parsed.targetLocale
    : "en";

  if (sourceLocale === targetLocale) {
    return NextResponse.json({ story });
  }

  const cacheKey = aiCacheKey([
    "translate",
    storyFingerprint(story),
    sourceLocale,
    targetLocale,
  ]);
  const cached = readAiCache<DevStory>(cacheKey);

  async function persistTranslation(translated: DevStory) {
    if (!parsed.storyId) return;
    const row = await getStory(parsed.storyId);
    if (!row) return;
    await saveStoryTranslation({
      id: parsed.storyId,
      locale: targetLocale,
      story: translated,
      authoredLocale: row.authoredLocale,
    });
  }

  if (cached) {
    await persistTranslation(cached);
    return NextResponse.json({ story: cached });
  }

  try {
    const translated = await translateStory(story, sourceLocale, targetLocale);
    writeAiCache(cacheKey, translated);
    await persistTranslation(translated);
    return NextResponse.json({ story: translated });
  } catch (error) {
    console.error("Translate route failed:", error);
    return NextResponse.json(
      { error: "Translation failed." },
      { status: 502 },
    );
  }
}
