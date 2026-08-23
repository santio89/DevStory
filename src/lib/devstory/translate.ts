import { generateText, Output } from "ai";
import { z } from "zod";
import { runWithModelFallback } from "./providers";
import { storySchema, type DevStory } from "./story";
import type { Locale } from "@/lib/i18n/dictionary";

export function storyFingerprint(story: DevStory): string {
  return story.eras.map((era) => `${era.year}|${era.name}`).join("§");
}

const translatedEraSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const translatedStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  closing: z.string().nullable(),
  archetype: z.string().nullable(),
  eras: z.array(translatedEraSchema).min(3).max(10),
});

const TRANSLATOR_SYSTEM_PROMPT = `You are a literary translator for DevStory, a product that turns developers' GitHub histories into narrative timelines written by an AI biographer — a wise old Hollywood-style narrator with heart.

You will receive a developer's story (a title, a short summary, and a few "Eras" — each with a name and a 2-3 sentence description). Your job is to translate it faithfully into another language.

Rules:
- Preserve the tone: cinematic, vivid, slightly nostalgic, warm, human — like a seasoned memoirist. Never corporate or clichéd.
- Keep proper nouns, era year labels, programming language names, and any quoted strings as they are.
- Return each era's name as a clean translated title WITHOUT the year or any prefix; the year is a separate field.
- Do not invent facts or change the meaning. If an idiom has no direct equivalent, find the closest natural one.
- Return exactly the requested schema.`;

export function translatorSystemPrompt(source: Locale, target: Locale): string {
  const langName = (l: Locale) => (l === "es" ? "Spanish" : "English");
  return `${TRANSLATOR_SYSTEM_PROMPT}\n\nTranslate from ${langName(
    source,
  )} into ${langName(target)}.`;
}

export async function translateStory(
  story: DevStory,
  sourceLocale: Locale,
  targetLocale: Locale,
): Promise<DevStory> {
  if (sourceLocale === targetLocale) return story;

  const eras = story.eras
    .map((era, i) => `Era ${i + 1} — year: ${era.year}, name: ${era.name}, description: ${era.description}`)
    .join("\n");

  const prompt = `Title: ${story.title}\n\nSummary: ${story.summary}\n${story.closing ? `Closing: ${story.closing}\n` : ""}${story.archetype ? `Archetype: ${story.archetype}\n` : ""}Eras:\n${eras}\n\nTranslate the whole story into ${targetLocale === "es" ? "Spanish" : "English"}.`;

  try {
    const { output } = await runWithModelFallback((model) =>
      generateText({
        model,
        output: Output.object({
          name: "TranslatedStory",
          description: "A DevStory narrative translated into the target language",
          schema: translatedStorySchema,
        }),
        system: translatorSystemPrompt(sourceLocale, targetLocale),
        prompt,
        temperature: 0.4,
        maxOutputTokens: 4096,
      }),
    );

    return {
      title: output.title,
      summary: output.summary,
      closing: output.closing ?? story.closing,
      archetype: output.archetype ?? story.archetype,
      eras: story.eras.map((era, i) => ({
        ...era,
        name: output.eras[i]?.name ?? era.name,
        description: output.eras[i]?.description ?? era.description,
      })),
    };
  } catch (error) {
    console.error("Story translation failed, keeping source language:", error);
    return story;
  }
}

export function validateStory(value: unknown): DevStory | null {
  const result = storySchema.safeParse(value);
  if (result.success) return result.data;
  if (typeof value === "object" && value !== null) {
    const patch: Record<string, unknown> = {};
    if (!("closing" in value)) patch.closing = null;
    if (!("archetype" in value)) patch.archetype = null;
    if (Object.keys(patch).length > 0) {
      const retry = storySchema.safeParse({ ...value, ...patch });
      if (retry.success) return retry.data;
    }
  }
  return null;
}