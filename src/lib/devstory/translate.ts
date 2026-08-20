import { z } from "zod";
import { generateText, Output } from "ai";
import { createModel } from "./generate";
import { storySchema, type DevStory } from "./story";
import type { Locale } from "@/lib/i18n/dictionary";

const translatedEraSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const translatedStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  closing: z.string().optional(),
  eras: z.array(translatedEraSchema).min(3).max(5),
});

const TRANSLATOR_SYSTEM_PROMPT = `You are a literary translator for Your Dev Story, a product that turns developers' GitHub histories into narrative timelines written by an AI biographer.

You will receive a developer's story (a title, a short summary, and a few "Eras" — each with a name and a 2-3 sentence description). Your job is to translate it faithfully into another language.

Rules:
- Preserve the tone: vivid, slightly nostalgic, warm, human. Never corporate or clichéd.
- Keep proper nouns, era year labels, programming language names, and any quoted strings as they are.
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
    .map((era) => `- ${era.year}: ${era.name}. ${era.description}`)
    .join("\n");

  const prompt = `Title: ${story.title}\n\nSummary: ${story.summary}\n${story.closing ? `Closing: ${story.closing}\n` : ""}Eras:\n${eras}\n\nTranslate the whole story into ${targetLocale === "es" ? "Spanish" : "English"}.`;

  try {
    const { output } = await generateText({
      model: createModel(),
      output: Output.object({
        name: "TranslatedStory",
        description: "A DevStory narrative translated into the target language",
        schema: translatedStorySchema,
      }),
      system: translatorSystemPrompt(sourceLocale, targetLocale),
      prompt,
      temperature: 0.4,
      maxOutputTokens: 2048,
    });

    return {
      title: output.title,
      summary: output.summary,
      closing: output.closing ?? story.closing,
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
  return result.success ? result.data : null;
}