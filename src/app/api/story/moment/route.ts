import { NextResponse } from "next/server";
import { todayMoment, NoAIError } from "@/lib/devstory/ai";
import { pickMomentAnchor } from "@/lib/devstory/moment";
import { validateStory } from "@/lib/devstory/translate";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    story?: unknown;
    data?: unknown;
    locale?: unknown;
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

  const era = story.eras[Math.floor(Math.random() * story.eras.length)] ?? story.eras[0];
  const anchor = pickMomentAnchor(data, era, locale);

  try {
    const moment = await todayMoment(story, data, anchor, locale);
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