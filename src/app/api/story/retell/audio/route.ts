import { NextResponse } from "next/server";
import { NoAIError } from "@/lib/devstory/ai";
import { ttsErrorMessage } from "@/lib/devstory/errors";
import { synthesizeStorySpeech } from "@/lib/devstory/tts";
import { validateStory } from "@/lib/devstory/translate";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    story?: unknown;
    locale?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";

  try {
    const audio = await synthesizeStorySpeech(story, locale);
    const bytes = new Uint8Array(audio);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=3600",
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
    const message = ttsErrorMessage(error);
    const status =
      error instanceof Error &&
      (error.message.includes("402") ||
        error.message.includes("Insufficient credits"))
        ? 402
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
