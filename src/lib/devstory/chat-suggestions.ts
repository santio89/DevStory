import type { StoryDataSnapshot } from "./minify";
import type { DevStory } from "./story";
import type { Messages } from "@/lib/i18n/dictionary";

export type ChatSuggestionPool = Messages["chat"]["suggestionPool"];

type SuggestionCategory =
  | "origins"
  | "era"
  | "repo"
  | "commit"
  | "character"
  | "languages"
  | "arc";

type Candidate = {
  category: SuggestionCategory;
  text: string;
  weight: number;
};

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededOrder<T>(items: T[], seed: string): T[] {
  const base = hashSeed(seed);
  return [...items]
    .map((item, i) => ({
      item,
      rank: (base + i * 2654435761) >>> 0,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.item);
}

function languageShift(
  data: StoryDataSnapshot,
): { from: string; to: string } | null {
  const years = data.languagesByYear;
  if (years.length < 2) return null;
  const first = years[0]?.languages[0]?.language;
  const last = years[years.length - 1]?.languages[0]?.language;
  if (!first || !last || first === last) return null;
  return { from: first, to: last };
}

function topRepo(data: StoryDataSnapshot): string | null {
  if (data.repos.length === 0) return null;
  const sorted = [...data.repos].sort((a, b) => b.stars - a.stars);
  return sorted[0]?.name ?? null;
}

function buildCandidates(
  username: string,
  story: DevStory,
  data: StoryDataSnapshot | null,
  pool: ChatSuggestionPool,
): Candidate[] {
  const candidates: Candidate[] = [
    {
      category: "origins",
      text: pool.earliestYears(username),
      weight: 2,
    },
    {
      category: "arc",
      text: pool.storyRepo(username),
      weight: 2,
    },
    {
      category: "arc",
      text: pool.invisibleHours(username),
      weight: 1,
    },
    {
      category: "origins",
      text: pool.quietStretch(username),
      weight: 1,
    },
  ];

  const firstEra = story.eras[0];
  const lastEra = story.eras[story.eras.length - 1];
  const middleEra = story.eras[Math.floor(story.eras.length / 2)];

  if (firstEra) {
    candidates.push({
      category: "origins",
      text: pool.firstLight(username, firstEra.year),
      weight: 3,
    });
  }

  if (middleEra && story.eras.length >= 3) {
    candidates.push({
      category: "era",
      text: pool.eraChapter(username, middleEra.name),
      weight: 4,
    });
  }

  if (lastEra && story.eras.length >= 2) {
    candidates.push({
      category: "era",
      text: pool.latestChapter(username, lastEra.name),
      weight: 4,
    });
  }

  if (story.archetype) {
    candidates.push({
      category: "character",
      text: pool.archetypeMeaning(username, story.archetype),
      weight: 5,
    });
  }

  if (data?.milestones[0]) {
    const m = data.milestones[0];
    candidates.push({
      category: "commit",
      text: pool.commitScene(username, truncate(m.msg, 48)),
      weight: 5,
    });
  }

  const repo = data ? topRepo(data) : null;
  if (repo) {
    candidates.push({
      category: "repo",
      text: pool.standoutRepo(username, repo),
      weight: 4,
    });
  }

  if (data) {
    const shift = languageShift(data);
    if (shift) {
      candidates.push({
        category: "languages",
        text: pool.languageTurn(username, shift.from, shift.to),
        weight: 4,
      });
    }
  }

  if (story.closing) {
    candidates.push({
      category: "arc",
      text: pool.journeyAhead(username),
      weight: 3,
    });
  }

  return candidates;
}

/** Pick 2–3 varied, context-aware chat prompts for the biographer. */
export function pickChatSuggestions({
  username,
  story,
  data,
  pool,
  count = 3,
  seed,
}: {
  username: string;
  story: DevStory;
  data: StoryDataSnapshot | null;
  pool: ChatSuggestionPool;
  count?: number;
  seed?: string;
}): string[] {
  const fingerprint =
    seed ??
    story.eras.map((e) => `${e.year}|${e.name}`).join("§");
  const candidates = buildCandidates(username, story, data, pool);
  const ranked = [...candidates].sort((a, b) => b.weight - a.weight);
  const picked: string[] = [];
  const usedCategories = new Set<SuggestionCategory>();
  const usedText = new Set<string>();

  for (const c of ranked) {
    if (picked.length >= count) break;
    if (usedCategories.has(c.category) && c.weight < 4) continue;
    if (usedText.has(c.text)) continue;
    picked.push(c.text);
    usedCategories.add(c.category);
    usedText.add(c.text);
  }

  if (picked.length < count) {
    const fallback = seededOrder(
      candidates.filter((c) => !usedText.has(c.text)),
      fingerprint,
    );
    for (const c of fallback) {
      if (picked.length >= count) break;
      if (usedText.has(c.text)) continue;
      picked.push(c.text);
      usedText.add(c.text);
    }
  }

  return seededOrder(picked, fingerprint).slice(0, count);
}
