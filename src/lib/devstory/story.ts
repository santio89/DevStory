import { z } from "zod";
import { TOKEN_GALLERY_TEXT, TOKEN_IDS } from "./tokens";

export const eraSchema = z.object({
  year: z
    .string()
    .describe("The year or range for this era, e.g. '2019' or '2019-2021'"),
  name: z
    .string()
    .describe(
      "A vivid, slightly nostalgic name for this era, e.g. 'The Hello World Era'",
    ),
  description: z
    .string()
    .describe(
      "2-3 sentences narrating what this developer was building and learning during this era. Must use a unique voice, metaphor, and opening rhythm — never repeat phrasing from other eras.",
    ),
  keyLanguages: z
    .array(z.string())
    .describe("The programming languages that defined this era, in order of importance"),
  token: z
    .enum(TOKEN_IDS)
    .describe(
      `The single sigil from the gallery that best embodies this era. Full gallery: ${TOKEN_GALLERY_TEXT}. Prefer distinct tokens across eras — never repeat a sigil within one story.`,
    ),
});

export const storySchema = z.object({
  title: z
    .string()
    .describe(
      "A short, evocative title for the developer's entire journey, e.g. 'The Kernel Keeper', 'Commits in the Half-Light'",
    ),
  summary: z
    .string()
    .describe(
      "2-4 sentences capturing the arc of this developer's growth. Synthesize the journey in fresh language — do not repeat sentences from era descriptions.",
    ),
  eras: z
    .array(eraSchema)
    .min(3)
    .max(10)
    .describe(
      "Distinct eras of this developer's journey in strict chronological order. Use more eras when the data spans many years and repos; fewer only when the history is genuinely sparse.",
    ),
  closing: z
    .string()
    .nullable()
    .describe(
      "1-2 warm, optimistic closing sentences that reference something specific from this developer's data (repo, language, era, or milestone). Personal, never generic. Must not repeat the summary wording.",
    ),
  archetype: z
    .string()
    .nullable()
    .describe(
      "A short, evocative archetype for the kind of developer this journey made, e.g. 'The Midnight Architect', 'The Polyglot Explorer', 'The Systems Builder', 'The Reluctant Maintainer'. 2-4 words, distinctive, never generic. Null if the data is too sparse to judge.",
    ),
});

export type DevStory = z.infer<typeof storySchema>;
export type Era = z.infer<typeof eraSchema>;