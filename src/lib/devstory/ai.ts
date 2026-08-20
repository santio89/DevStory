import { generateText, Output, streamText } from "ai";
import { z } from "zod";
import { createModel, hasAIProviderConfigured } from "./generate";
import type { DevStory, Era } from "./story";
import type { StoryDataSnapshot } from "./minify";
import type { Locale } from "@/lib/i18n/dictionary";

export const REMIX_VOICES = ["cyberpunk", "noir", "letter", "fantasy"] as const;
export type RemixVoice = (typeof REMIX_VOICES)[number];

export class NoAIError extends Error {
  constructor() {
    super("No AI provider configured");
  }
}

function langInstruction(locale: Locale): string {
  return locale === "es"
    ? "Write everything in Spanish (es-ES)."
    : "Write everything in English.";
}

const remixStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  closing: z.string().nullable(),
  archetype: z.string().nullable(),
  eras: z.array(z.object({ name: z.string(), description: z.string() })).min(3).max(5),
});

const REMIX_PROMPTS: Record<RemixVoice, string> = {
  cyberpunk: `Re-tell this developer's journey as a cyberpunk legend: neon-lit arcologies, chrome and rain, a coder turned net-runner. Keep the data and the arc identical, but make it feel like a night-shift myth. Vivid, gritty, a little dangerous.`,
  noir: `Re-tell this developer's journey as a hard-boiled noir: rain-slicked streets, a lone figure in a dim office, commits arriving like confessions. Same arc and facts, but narrated by a world-weary detective who has seen it all.`,
  letter: `Re-write this journey as a letter to the developer's younger self: second person, warm, tender, a little funny. Same facts and arc, but addressed to the person who wrote the first line of code.`,
  fantasy: `Re-tell this developer's journey as an epic fantasy: guilds of frameworks, dungeons of legacy code, a hero who keeps answering the call. Same arc and facts, in the voice of a tavern bard telling a legend.`,
};

const REMIX_RULES = `Rewrite EVERYTHING into that voice — the title must change completely (a new, evocative title in that register), the summary, each era's name and description, the closing, and the archetype (recast it in that world, e.g. noir keeps it human, fantasy makes it a title). Keep the facts, the arc, the years, and the structure identical. Never generic.`;

export async function remixStory(
  story: DevStory,
  voice: RemixVoice,
  locale: Locale,
): Promise<DevStory> {
  if (!hasAIProviderConfigured()) throw new NoAIError();

  const eras = story.eras
    .map((era, i) => `Era ${i + 1} — year: ${era.year}, name: ${era.name}, description: ${era.description}`)
    .join("\n");

  const system = `You are a re-teller of developer stories for Your Dev Story. You keep the facts, the arc, and the structure identical, but you change the narrator's voice.
${REMIX_PROMPTS[voice]}
${REMIX_RULES}
Keep each era's name a clean retitled title WITHOUT the year prefix. Return exactly the requested schema.
${langInstruction(locale)}`;

  const prompt = `Original story:
Title: ${story.title}
Summary: ${story.summary}
${story.closing ? `Closing: ${story.closing}\n` : ""}${story.archetype ? `Archetype: ${story.archetype}\n` : ""}Eras:
${eras}`;

  const { output } = await generateText({
    model: createModel(),
    output: Output.object({
      name: "RemixedStory",
      description: "The same DevStory re-told in a new narrative voice",
      schema: remixStorySchema,
    }),
    system,
    prompt,
    temperature: 0.9,
    maxOutputTokens: 2048,
  });

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
}

const deepDiveSchema = z.object({
  narrative: z
    .string()
    .describe("2-3 paragraphs of vivid narrative about this era, grounded in the given data"),
  highlights: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe("3-4 short, punchy insights, each one a full sentence"),
});

export async function deepDiveEra(
  era: Era,
  data: StoryDataSnapshot | null,
  locale: Locale,
): Promise<{ narrative: string; highlights: string[] }> {
  if (!hasAIProviderConfigured()) throw new NoAIError();

  const eraData = eraContext(era, data);
  const system = `You are the research assistant of Your Dev Story's biographer. Given one era of a developer's story and the raw facts around it, you write a deeper, fuller chapter.
Rules:
- Ground every claim in the given facts. Never invent repositories, languages, or dates that are not present.
- The narrative should feel like a memoir chapter: vivid, warm, human, 2-3 paragraphs.
- The highlights are short sentences a reader could quote.
- If no raw data is available, say what can be said beautifully from the era itself, and stay honest about the rest.
${langInstruction(locale)}`;

  const { output } = await generateText({
    model: createModel(),
    output: Output.object({
      name: "EraDeepDive",
      description: "A deeper narrative chapter for one era, plus quotable highlights",
      schema: deepDiveSchema,
    }),
    system,
    prompt: `Era: ${era.year} — ${era.name}\n${era.description}\n\nRaw data context:\n${eraData || "(no detailed data available)"}`,
    temperature: 0.8,
    maxOutputTokens: 1024,
  });

  return output;
}

function eraContext(era: Era, data: StoryDataSnapshot | null): string {
  if (!data) return "";
  const yearMatch = era.year.match(/\d{4}/)?.[0];
  const year = yearMatch ?? "";

  const repos = data.repos
    .filter((r) => !year || r.created.slice(0, 4) === year)
    .slice(0, 6)
    .map((r) => `- ${r.name} (${r.created}, ${r.lang ?? "no language"}, ${r.commits} commits analyzed)`)
    .join("\n");

  const langs = data.languagesByYear
    .filter((y) => !year || y.year === year)
    .map((y) => `- ${y.year}: ${y.languages.map((l) => `${l.language} x${l.repoCount}`).join(", ") || "none"}`)
    .join("\n");

  const commits = data.milestones
    .filter((m) => !year || m.date.slice(0, 4) === year)
    .slice(0, 5)
    .map((m) => `- ${m.date} ${m.repo}: "${m.msg}"`)
    .join("\n");

  const parts = [
    repos ? `Repos created around this era:\n${repos}` : "",
    langs ? `Languages that year:\n${langs}` : "",
    commits ? `Commit milestones:\n${commits}` : "",
  ].filter(Boolean);
  return parts.join("\n\n");
}

const momentSchema = z.object({
  title: z.string().describe("A short evocative title for this moment, e.g. 'The 2am Refactor'"),
  text: z
    .string()
    .describe("2-4 sentences narrating this moment in the developer's voice, warm and human"),
});

export async function todayMoment(
  story: DevStory,
  data: StoryDataSnapshot | null,
  era: Era,
  locale: Locale,
): Promise<{ title: string; text: string; year: string }> {
  if (!hasAIProviderConfigured()) throw new NoAIError();

  const system = `You are the memory-keeper of Your Dev Story. Given one era and the raw facts around it, you pick a single believable, vivid moment from that era and narrate it in the developer's own voice — as if they were remembering it.
Rules:
- Ground it in the given facts when available; otherwise invent nothing specific — keep it warm, specific to the era, and honest.
- The title is short and evocative. The text is 2-4 sentences.
${langInstruction(locale)}`;

  const { output } = await generateText({
    model: createModel(),
    output: Output.object({
      name: "TodayMoment",
      description: "A single remembered moment from one era of a developer's journey",
      schema: momentSchema,
    }),
    system,
    prompt: `Era: ${era.year} — ${era.name}\n${era.description}\n\nRaw data context:\n${eraContext(era, data) || "(no detailed data available)"}`,
    temperature: 0.95,
    maxOutputTokens: 400,
  });

  return { title: output.title, text: output.text, year: era.year };
}

export function chatSystemPrompt(
  story: DevStory,
  data: StoryDataSnapshot | null,
): string {
  return `You are the narrator of "Your Dev Story" — the ghost inside the product. You know everything about this developer: their GitHub history, their eras, their archetype. You answer questions about their journey with warmth, wit, and honesty.

The developer's story:
${JSON.stringify(story)}

Raw facts about their history (may be partial):
${data ? JSON.stringify(data) : "(no detailed raw data available)"}

Rules:
- Stay grounded: use the story and facts above. If you don't know, say so — never invent repositories, languages, or dates.
- Be warm, human, a little playful. Avoid corporate-speak and clichés.
- Answer in the same language the developer writes in.
- Keep answers concise (usually under 150 words). You may ask one follow-up question.
- If they ask about their future, speculate poetically, not factually.`;
}

export type ChatRole = "user" | "assistant";

export function chatStream(
  system: string,
  messages: { role: ChatRole; content: string }[],
) {
  if (!hasAIProviderConfigured()) throw new NoAIError();
  return streamText({
    model: createModel(),
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.8,
    maxOutputTokens: 512,
  });
}