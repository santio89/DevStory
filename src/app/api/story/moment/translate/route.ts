import { NextResponse } from "next/server";
import { translateMoment, NoAIError } from "@/lib/devstory/ai";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    moment?: unknown;
    locale?: unknown;
  };

  const m = body.moment as { title?: unknown; text?: unknown } | undefined;
  if (
    !m ||
    typeof m.title !== "string" ||
    typeof m.text !== "string" ||
    !m.title.trim() ||
    !m.text.trim()
  ) {
    return NextResponse.json({ error: "Invalid moment payload." }, { status: 400 });
  }

  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";

  try {
    const translated = await translateMoment(
      { title: m.title, text: m.text },
      locale,
    );
    return NextResponse.json(translated);
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Moment translate route failed:", error);
    return NextResponse.json({ error: "Translation failed." }, { status: 502 });
  }
}