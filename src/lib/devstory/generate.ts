import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { generateMockStory } from "./mock";
import { minifyDevStory } from "./minify";
import { BIOGRAPHER_SYSTEM_PROMPT, buildPrompt } from "./prompt";
import { storySchema, type DevStory } from "./story";
import type { DevStoryData } from "./aggregate";

export type StoryResult = {
  story: DevStory;
  mode: "ai" | "mock";
};

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_NAME = "DevStory";

export function hasAIProviderConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function createModel() {
  const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
    headers: {
      "HTTP-Referer": "https://devstory.app",
      "X-Title": APP_NAME,
    },
  });
  return openai(process.env.OPENROUTER_MODEL ?? "openai/gpt-4.1-mini");
}

export async function generateStory(
  data: DevStoryData,
): Promise<StoryResult> {
  if (!hasAIProviderConfigured()) {
    return { story: generateMockStory(data), mode: "mock" };
  }

  const minified = minifyDevStory(data);

  try {
    const { output } = await generateText({
      model: createModel(),
      output: Output.object({
        name: "DevStory",
        description: "A developer's narrative timeline as a set of eras",
        schema: storySchema,
      }),
      system: BIOGRAPHER_SYSTEM_PROMPT,
      prompt: buildPrompt(minified),
      temperature: 0.8,
      maxOutputTokens: 2048,
    });
    return { story: output, mode: "ai" };
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

const EMAIL_SYSTEM_PROMPT = `You are DevStory's letter writer. Given a developer's story (title, summary, and eras), write two short pieces of email copy:
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
    const { output } = await generateText({
      model: createModel(),
      output: Output.object({
        name: "EmailCopy",
        description: "An email subject line and closing P.S. for a DevStory email",
        schema: emailCopySchema,
      }),
      system: EMAIL_SYSTEM_PROMPT,
      prompt: `Title: ${story.title}\n\nSummary: ${story.summary}\n\nEras:\n${eras}`,
      temperature: 0.9,
      maxOutputTokens: 150,
    });
    return output;
  } catch (error) {
    console.error("Email copy generation failed, using fallback:", error);
    return { subject: story.title, ps: "" };
  }
}