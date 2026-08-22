import { generateText, Output } from "ai";
import { z } from "zod";
import { generateMockStory } from "./mock";
import { minifyDevStory } from "./minify";
import { BIOGRAPHER_SYSTEM_PROMPT, buildPrompt } from "./prompt";
import { storySchema, type DevStory } from "./story";
import type { DevStoryData } from "./aggregate";
import type { Locale } from "@/lib/i18n/dictionary";
import { eraCountGuidance } from "./story-richness";
import { buildNarrativeFingerprint, buildUniquenessGuidance } from "./narrative-context";
import {
  buildVarietyCorrection,
  needsVarietyRetry,
  storyVarietyIssues,
} from "./variety";
import {
  hasAIProviderConfigured,
  runWithModelFallback,
} from "./providers";

export type StoryResult = {
  story: DevStory;
  mode: "ai" | "mock";
};

export { hasAIProviderConfigured } from "./providers";

async function generateStoryFromAI(
  minified: string,
  locale: Locale,
  eraGuidance: string,
  uniquenessGuidance: string,
  extraPrompt = "",
): Promise<DevStory> {
  const { output } = await runWithModelFallback((model) =>
    generateText({
      model,
      output: Output.object({
        name: "DevStory",
        description: "A developer's narrative timeline as a set of eras",
        schema: storySchema,
      }),
      system: BIOGRAPHER_SYSTEM_PROMPT,
      prompt: `${buildPrompt(minified, locale, eraGuidance, uniquenessGuidance)}${extraPrompt}`,
      temperature: extraPrompt ? 0.92 : 0.88,
      maxOutputTokens: 4096,
    }),
  );
  return output;
}

export async function generateStory(
  data: DevStoryData,
  locale: Locale = "en",
): Promise<StoryResult> {
  if (!hasAIProviderConfigured()) {
    return { story: generateMockStory(data), mode: "mock" };
  }

  const fingerprint = buildNarrativeFingerprint(data);
  const minified = minifyDevStory(data, fingerprint);
  const eraGuidance = eraCountGuidance(data);
  const uniquenessGuidance = buildUniquenessGuidance(data, fingerprint);

  try {
    let story = await generateStoryFromAI(
      minified,
      locale,
      eraGuidance,
      uniquenessGuidance,
    );

    if (needsVarietyRetry(story)) {
      const issues = storyVarietyIssues(story);
      console.warn("Story variety check failed, retrying:", issues);
      const revised = await generateStoryFromAI(
        minified,
        locale,
        eraGuidance,
        uniquenessGuidance,
        `\n\n${buildVarietyCorrection(issues)}`,
      );
      if (!needsVarietyRetry(revised)) {
        story = revised;
      }
    }

    return { story, mode: "ai" };
  } catch (error) {
    console.error("AI story generation failed, falling back to mock:", error);
    return { story: generateMockStory(data), mode: "mock" };
  }
}

export const emailCopySchema = z.object({
  subject: z.string().min(3).max(90),
  ps: z.string().min(1).max(240),
});

export type EmailCopy = z.infer<typeof emailCopySchema>;

const EMAIL_SYSTEM_PROMPT = `You are Dev Story's letter writer. Given a developer's story (title, summary, and eras), write two short pieces of email copy:
1. A subject line (max 90 chars) that feels personal and evokes the arc of the story.
2. A single "P.S." line (max 240 chars) that closes the email like a handwritten letter — warm, human, a little poetic. Never generic.

Return exactly the schema.`;

export async function generateEmailCopy(story: DevStory): Promise<EmailCopy> {
  if (!hasAIProviderConfigured()) {
    return { subject: story.title, ps: "" };
  }

  const eras = story.eras
    .map((era) => `${era.year} — ${era.name}: ${era.description}`)
    .join("\n");

  try {
    const { output } = await runWithModelFallback((model) =>
      generateText({
        model,
        output: Output.object({
          name: "EmailCopy",
          description: "An email subject line and closing P.S. for a Dev Story email",
          schema: emailCopySchema,
        }),
        system: EMAIL_SYSTEM_PROMPT,
        prompt: `Title: ${story.title}\n\nSummary: ${story.summary}\n\nEras:\n${eras}`,
        temperature: 0.9,
        maxOutputTokens: 150,
      }),
    );
    return output;
  } catch (error) {
    console.error("Email copy generation failed, using fallback:", error);
    return { subject: story.title, ps: "" };
  }
}
