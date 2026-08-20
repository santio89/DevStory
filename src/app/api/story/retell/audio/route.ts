import { NextResponse } from "next/server";
import {
  REMIX_VOICES,
  NoAIError,
  type RemixVoice,
} from "@/lib/devstory/ai";
import { synthesizeStorySpeech } from "@/lib/devstory/tts";
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

  const voiceValue = typeof body.voice === "string" ? body.voice : null;
  if (!voiceValue || !(REMIX_VOICES as readonly string[]).includes(voiceValue)) {
    return NextResponse.json({ error: "Invalid voice." }, { status: 400 });
  }
  const voice = voiceValue as RemixVoice;

  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";

  try {
    const audio = await synthesizeStorySpeech(story, voice, locale);
    const body = new Uint8Array(audio);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(body.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Retell audio route failed:", error);
    return NextResponse.json(
      { error: "Couldn't synthesize audio." },
      { status: 502 },
    );
  }
}