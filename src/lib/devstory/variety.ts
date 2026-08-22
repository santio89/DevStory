import type { DevStory } from "./story";

/** Phrases that read as filler when repeated across eras or the whole story. */
export const BANNED_STORY_PHRASES = [
  "one repo at a time",
  "figuring things out",
  "stepping stone",
  "keeps showing up",
  "the next chapter starts",
  "every late-night commit",
  "a journey of growth",
  "building one repo",
  "repo by repo",
  "one commit at a time",
  "chapter in their journey",
  "along the way",
  "never looked back",
  "passion for coding",
  "love of learning",
  "developer journey",
] as const;

const GENERIC_TITLE_PATTERNS = [
  /developer journey/i,
  /^from .+ to .+$/i,
  /^the journey of/i,
];

const GENERIC_ARCHETYPES = [
  "the developer",
  "the coder",
  "the programmer",
  "the builder",
  "the focused builder",
  "the steady crafter",
] as const;

const MIN_REPEATED_WORDS = 4;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordPhrases(text: string, size: number): Set<string> {
  const words = normalize(text).split(" ").filter(Boolean);
  const phrases = new Set<string>();
  for (let i = 0; i <= words.length - size; i++) {
    phrases.add(words.slice(i, i + size).join(" "));
  }
  return phrases;
}

export function findBannedPhrases(story: DevStory): string[] {
  const corpus = [
    story.summary,
    story.closing ?? "",
    ...story.eras.map((era) => `${era.name} ${era.description}`),
  ]
    .join(" ")
    .toLowerCase();

  return BANNED_STORY_PHRASES.filter((phrase) => corpus.includes(phrase));
}

export function findRepeatedPhrases(
  texts: string[],
  minWords = MIN_REPEATED_WORDS,
): string[] {
  const counts = new Map<string, number>();

  for (const text of texts) {
    for (const phrase of wordPhrases(text, minWords)) {
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase);
}

export function storyVarietyIssues(story: DevStory): string[] {
  const issues: string[] = [];

  const banned = findBannedPhrases(story);
  if (banned.length > 0) {
    issues.push(`Banned clichés found: ${banned.map((p) => `"${p}"`).join(", ")}`);
  }

  const eraDescriptions = story.eras.map((era) => era.description);
  const repeatedEraPhrases = findRepeatedPhrases(eraDescriptions);
  if (repeatedEraPhrases.length > 0) {
    issues.push(
      `Repeated phrases across era descriptions: ${repeatedEraPhrases
        .slice(0, 4)
        .map((p) => `"${p}"`)
        .join(", ")}`,
    );
  }

  const openingPhrases = eraDescriptions
    .map((text) => normalize(text).split(" ").slice(0, 6).join(" "))
    .filter(Boolean);
  const duplicateOpenings = openingPhrases.filter(
    (phrase, index) => openingPhrases.indexOf(phrase) !== index,
  );
  if (duplicateOpenings.length > 0) {
    issues.push("Multiple eras start with the same opening pattern.");
  }

  const summaryNorm = normalize(story.summary);
  const summaryOverlapsEra = eraDescriptions.some((era) => {
    const eraNorm = normalize(era);
    return (
      eraNorm.length > 40 &&
      (summaryNorm.includes(eraNorm.slice(0, 50)) ||
        eraNorm.includes(summaryNorm.slice(0, 50)))
    );
  });
  if (summaryOverlapsEra) {
    issues.push("Summary repeats wording from an era description.");
  }

  if (story.closing) {
    const closingNorm = normalize(story.closing);
    const closingOverlaps = eraDescriptions.some((era) =>
      findRepeatedPhrases([era, story.closing!]).length > 0,
    );
    if (closingOverlaps || closingNorm === summaryNorm) {
      issues.push("Closing repeats the summary or era wording.");
    }
  }

  const tokens = story.eras.map((era) => era.token);
  const duplicateTokens = tokens.filter(
    (token, index) => tokens.indexOf(token) !== index,
  );
  if (duplicateTokens.length > 0) {
    issues.push(
      `Duplicate sigil tokens across eras: ${[...new Set(duplicateTokens)].join(", ")}`,
    );
  }

  const eraNames = story.eras.map((era) => normalize(era.name));
  const duplicateEraNames = eraNames.filter(
    (name, index) => eraNames.indexOf(name) !== index,
  );
  if (duplicateEraNames.length > 0) {
    issues.push("Two or more eras share the same name.");
  }

  if (GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(story.title))) {
    issues.push(`Title reads generic: "${story.title}"`);
  }

  if (
    story.archetype &&
    GENERIC_ARCHETYPES.includes(
      story.archetype.toLowerCase() as (typeof GENERIC_ARCHETYPES)[number],
    )
  ) {
    issues.push(`Archetype is too generic: "${story.archetype}"`);
  }

  return issues;
}

export function needsVarietyRetry(story: DevStory): boolean {
  return storyVarietyIssues(story).length > 0;
}

export function buildVarietyCorrection(issues: string[]): string {
  return `REVISION REQUIRED — your previous draft failed quality checks:
${issues.map((issue) => `- ${issue}`).join("\n")}

Rewrite the entire story from scratch with these rules:
- Every era description must use a different angle, metaphor, and sentence rhythm. No copy-paste structure.
- Never reuse the same phrase, hook, or closing cadence across eras.
- The summary must synthesize the arc in fresh language — do not echo era sentences.
- The closing must name something specific from THIS developer's data (a language shift, repo pattern, era name, or milestone) and end on a note that could only belong to them.
- Avoid all banned clichés listed above.
- Assign a different sigil token to every era — no duplicates.
- Name specific repositories and quote at least one real commit message from the data.`;
}
