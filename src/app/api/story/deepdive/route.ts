import { NextResponse } from "next/server";
import { deepDiveEra, NoAIError } from "@/lib/devstory/ai";
import { eraSchema } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    era?: unknown;
    data?: unknown;
    locale?: unknown;
  };

  const era = eraSchema.safeParse(body.era);
  if (!era.success) {
    return NextResponse.json({ error: "Invalid era payload." }, { status: 400 });
  }

  const data =
    body.data && typeof body.data === "object"
      ? (body.data as StoryDataSnapshot)
      : null;
  const localeValue = typeof body.locale === "string" ? body.locale : undefined;
  const locale: Locale = isLocale(localeValue) ? localeValue : "en";

  try {
    const result = await deepDiveEra(era.data, data, locale);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Deep dive route failed:", error);
    return NextResponse.json({ error: "Deep dive failed." }, { status: 502 });
  }
}