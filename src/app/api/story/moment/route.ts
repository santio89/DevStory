import { NextResponse } from "next/server";
import { todayMoment, NoAIError } from "@/lib/devstory/ai";
import { aiCacheKey, readAiCache, writeAiCache } from "@/lib/devstory/ai-cache";
import { pickMomentAnchor } from "@/lib/devstory/moment";
import { seededIndex } from "@/lib/devstory/seeded";
import { validateStory } from "@/lib/devstory/translate";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    story?: unknown;
    data?: unknown;
    locale?: unknown;
    seed?: unknown;
    refresh?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const data =
    body.data && typeof body.data === "object"
      ? (body.data as StoryDataSnapshot)
      : null;
  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";
  const refresh = body.refresh === true;
  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");
  const seed =
    !refresh && typeof body.seed === "string" && body.seed.trim()
      ? body.seed.trim()
      : refresh
        ? undefined
        : fingerprint;

  const eraIndex = seed
    ? seededIndex(`${seed}:era`, story.eras.length)
    : Math.floor(Math.random() * story.eras.length);
  const era = story.eras[eraIndex] ?? story.eras[0];
  const anchor = pickMomentAnchor(
    data,
    era,
    locale,
    seed ? { seed } : undefined,
  );

  const anchorKey =
    anchor.kind === "memory"
      ? `memory:${anchor.year}:${anchor.event}`
      : `era:${anchor.era.year}:${anchor.era.name}`;
  const cacheKey = aiCacheKey([
    "moment",
    fingerprint,
    locale,
    seed ?? "random",
    anchorKey,
  ]);

  if (!refresh) {
    const cached = readAiCache<{
      title: string;
      text: string;
      year: string;
      dateLabel: string;
    }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  try {
    const moment = await todayMoment(story, data, anchor, locale);
    if (!refresh) writeAiCache(cacheKey, moment);
    return NextResponse.json(moment);
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Moment route failed:", error);
    return NextResponse.json({ error: "Moment failed." }, { status: 502 });
  }
}
