import { createHash } from "node:crypto";
import type { DevStoryData } from "./aggregate";

const METAPHOR_LENSES = [
  "maritime — ships, harbors, tides, anchors, navigation",
  "celestial — orbits, constellations, dawn, signals from far away",
  "workshop — forges, circuits, blueprints, tools on a bench",
  "garden — roots, sprouts, seasons, patience, growth rings",
  "city — bridges, gates, labyrinths of streets, skylines",
  "archaeology — strata, scrolls, keys, unearthed layers",
  "music — rhythm, pulse, harmony, rehearsal, crescendo",
  "cartography — compasses, peaks, canyons, mapping unknown terrain",
] as const;

function seedFromUsername(username: string): number {
  const hash = createHash("sha256").update(username.toLowerCase()).digest();
  return hash.readUInt32BE(0);
}

function pickLens(username: string): (typeof METAPHOR_LENSES)[number] {
  return METAPHOR_LENSES[seedFromUsername(username) % METAPHOR_LENSES.length];
}

function languageShifts(data: DevStoryData): string[] {
  const shifts: string[] = [];
  let prev: string | null = null;

  for (const year of data.languagesByYear) {
    const top = year.languages[0]?.language ?? null;
    if (top && prev && top !== prev) {
      shifts.push(`${prev} → ${top} (around ${year.year})`);
    }
    if (top) prev = top;
  }

  return shifts;
}

function standoutRepos(data: DevStoryData) {
  const byStars = [...data.repos].sort((a, b) => b.stars - a.stars);
  const chronological = [...data.repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const picks = new Map<string, string>();

  if (chronological[0]) {
    picks.set(
      chronological[0].name,
      `first public repo (${chronological[0].createdAt.slice(0, 10)})`,
    );
  }
  if (chronological.at(-1)) {
    picks.set(
      chronological.at(-1)!.name,
      `most recent repo (${chronological.at(-1)!.createdAt.slice(0, 10)})`,
    );
  }
  for (const repo of byStars.slice(0, 3)) {
    if (repo.stars > 0) {
      picks.set(repo.name, `${repo.stars} stars · ${repo.language ?? "?"}`);
    }
  }

  return [...picks.entries()].map(([name, note]) => ({ name, note }));
}

function interestingCommits(data: DevStoryData, limit = 8): string[] {
  const lines: string[] = [];

  for (const m of data.milestones.slice(0, 4)) {
    lines.push(`${m.repo} (${m.date.slice(0, 10)}): "${m.message}"`);
  }

  for (const [repoName, rc] of Object.entries(data.repoCommits)) {
    for (const c of rc.recentCommits.slice(0, 2)) {
      const line = `${repoName} (${c.date.slice(0, 10)}): "${c.message}"`;
      if (!lines.includes(line) && lines.length < limit) {
        lines.push(line);
      }
    }
  }

  return lines.slice(0, limit);
}

function busiestYear(data: DevStoryData): string | null {
  let best: { year: string; count: number } | null = null;

  for (const year of data.languagesByYear) {
    const count = year.languages.reduce((sum, l) => sum + l.repoCount, 0);
    if (!best || count > best.count) {
      best = { year: year.year, count };
    }
  }

  return best ? `${best.year} (${best.count} repo-language entries)` : null;
}

export type NarrativeFingerprint = {
  metaphorLens: string;
  languageShifts: string[];
  standoutRepos: { name: string; note: string }[];
  commitVoices: string[];
  busiestYear: string | null;
  archivedRepos: number;
  topLanguages: string[];
  writingMandates: string[];
};

export function buildNarrativeFingerprint(data: DevStoryData): NarrativeFingerprint {
  const shifts = languageShifts(data);
  const standouts = standoutRepos(data);
  const lens = pickLens(data.username);

  const mandates = [
    data.profile.bio
      ? `Honor their GitHub bio in tone and motivation: "${data.profile.bio}"`
      : null,
    `Quote at least one real commit message from the data verbatim.`,
    `Name at least ${Math.min(3, Math.max(2, standouts.length))} specific repositories by exact name.`,
    standouts[0]
      ? `Open at least one era with a detail from ${standouts[0].name}.`
      : `Ground the opening era in their earliest repository.`,
    shifts[0]
      ? `Acknowledge the language shift: ${shifts[0]}.`
      : `Note what language(s) dominated and whether focus stayed narrow or wandered.`,
    `Use the "${lens.split(" — ")[0]}" metaphor family as a subtle thread — not every sentence, but enough that this story could not belong to another developer.`,
    `Choose a title that does NOT follow "From X to Y", "The Journey of…", or "[Name]'s Developer Journey".`,
    `Assign a distinct sigil token to every era — never repeat a token within one story.`,
  ];

  return {
    metaphorLens: lens,
    languageShifts: shifts,
    standoutRepos: standouts,
    commitVoices: interestingCommits(data),
    busiestYear: busiestYear(data),
    archivedRepos: data.repos.filter((r) => r.archived).length,
    topLanguages: data.languages.slice(0, 5).map((l) => l.language),
    writingMandates: mandates.filter((m): m is string => Boolean(m)),
  };
}

export function buildUniquenessGuidance(
  data: DevStoryData,
  fingerprint = buildNarrativeFingerprint(data),
): string {
  const repoLines = fingerprint.standoutRepos
    .map((r) => `  · ${r.name} — ${r.note}`)
    .join("\n");
  const commitLines =
    fingerprint.commitVoices.length > 0
      ? fingerprint.commitVoices.map((c) => `  · ${c}`).join("\n")
      : "  · (sparse — lean on repo names, dates, and language shifts)";

  return `UNIQUENESS CONTRACT — @${data.username}
This timeline must be unmistakably theirs. Generic biographer prose that could describe any developer is a failure.
${data.profile.bio ? `\nTheir GitHub bio (in their own words): "${data.profile.bio}" — let this shape how you see their motivation and voice.\n` : ""}
Follow the narrativeFingerprint object in the JSON above — especially metaphorLens and writingMandates.

Narrative lens for THIS story only: ${fingerprint.metaphorLens}

Repos to anchor the narrative (use exact names):
${repoLines || "  · (use repos from allReposChronological)"}

Real commit voices (quote at least one verbatim):
${commitLines}
${fingerprint.languageShifts.length ? `\nLanguage shifts detected:\n${fingerprint.languageShifts.map((s) => `  · ${s}`).join("\n")}` : ""}
${fingerprint.busiestYear ? `\nBusiest stretch: ${fingerprint.busiestYear}` : ""}
${fingerprint.archivedRepos > 0 ? `\nArchived repos: ${fingerprint.archivedRepos} (graveyards of curiosity — mention if relevant)` : ""}
Top languages overall: ${fingerprint.topLanguages.join(", ") || "unknown"}

Sigils: pick one token per era from the schema gallery — all distinct within this story.`;
}
