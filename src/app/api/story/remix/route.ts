import { NextResponse } from "next/server";
import { remixStory, REMIX_VOICES, NoAIError, type RemixVoice } from "@/lib/devstory/ai";
import { validateStory } from "@/lib/devstory/translate";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    story?: unknown;
    voice?: unknown;
    locale?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const voice = REMIX_VOICES.includes(body.voice as RemixVoice)
    ? (body.voice as RemixVoice)
    : "cyberpunk";
  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";

  try {
    const remixed = await remixStory(story, voice, locale);
    return NextResponse.json({ story: remixed });
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Remix route failed:", error);
    return NextResponse.json({ error: "Remix failed." }, { status: 502 });
  }
}