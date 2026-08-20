import { z } from "zod";
import { TOKEN_IDS, TOKEN_MEANINGS } from "./tokens";

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
      "2-3 sentences narrating what this developer was building and learning during this era",
    ),
  keyLanguages: z
    .array(z.string())
    .describe("The programming languages that defined this era, in order of importance"),
  token: z
    .enum(TOKEN_IDS)
    .describe(
      `The single sigil from the gallery that best embodies this era. Gallery: ${TOKEN_IDS.map((t) => `${t} (${TOKEN_MEANINGS[t]})`).join("; ")}. Prefer distinct tokens across eras.`,
    ),
});

export const storySchema = z.object({
  title: z
    .string()
    .describe(
      "A short, evocative title for the developer's entire journey, e.g. 'From Hello World to Systems'",
    ),
  summary: z
    .string()
    .describe(
      "2-4 sentences capturing the arc of this developer's growth",
    ),
  eras: z
    .array(eraSchema)
    .min(3)
    .max(5)
    .describe(
      "The 3-5 distinct eras of this developer's journey, in strict chronological order",
    ),
  closing: z
    .string()
    .optional()
    .describe(
      "1-2 warm, optimistic closing sentences that look back on the whole journey and leave the developer feeling proud — the road traveled, and the road still ahead. Personal, never generic.",
    ),
});

export type DevStory = z.infer<typeof storySchema>;
export type Era = z.infer<typeof eraSchema>;