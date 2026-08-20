import { NextResponse } from "next/server";
import { translateStory, validateStory } from "@/lib/devstory/translate";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    story?: unknown;
    sourceLocale?: unknown;
    targetLocale?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const sourceValue =
    typeof body.sourceLocale === "string" ? body.sourceLocale : undefined;
  const targetValue =
    typeof body.targetLocale === "string" ? body.targetLocale : undefined;
  const sourceLocale: Locale = isLocale(sourceValue) ? sourceValue : "en";
  const targetLocale: Locale = isLocale(targetValue) ? targetValue : "en";

  try {
    const translated = await translateStory(story, sourceLocale, targetLocale);
    return NextResponse.json({ story: translated });
  } catch (error) {
    console.error("Translate route failed:", error);
    return NextResponse.json(
      { error: "Translation failed." },
      { status: 502 },
    );
  }
}