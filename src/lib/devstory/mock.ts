import { createHash } from "node:crypto";
import type { DevStoryData } from "./aggregate";
import type { DevStory, Era } from "./story";
import { TOKEN_IDS } from "./tokens";
import { computeTargetEraCount } from "./story-richness";
import { needsVarietyRetry } from "./variety";

type EraBucket = { years: string[]; languages: string[] };

type EraContext = {
  username: string;
  range: string;
  startYear: string;
  endYear: string;
  langs: string;
  primaryLang: string;
  repos: { name: string; desc: string | null; stars: number; lang: string | null }[];
  milestone: { repo: string; message: string; date: string } | null;
};

type StoryContext = {
  username: string;
  repoCount: number;
  totalStars: number;
  yearSpan: number;
  firstLang: string | null;
  lastLang: string | null;
  firstEraName: string;
  lastEraName: string;
  oldestRepo: string | null;
  newestRepo: string | null;
  topRepo: { name: string; stars: number } | null;
  firstCommit: { message: string; repo: string } | null;
  lastCommit: { message: string; repo: string } | null;
  bio: string | null;
};

class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.next() % items.length];
  }

  pickUnique<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const chosen: T[] = [];
    while (chosen.length < count && pool.length > 0) {
      const index = this.next() % pool.length;
      chosen.push(pool.splice(index, 1)[0]);
    }
    return chosen;
  }
}

function seedFromData(data: DevStoryData, salt = 0): number {
  const payload = [
    data.username,
    String(data.totals.repoCount),
    ...data.repos.slice(0, 12).map((repo) => repo.name),
    ...data.milestones.slice(0, 8).map((m) => m.message),
    String(salt),
  ].join("|");

  const hash = createHash("sha256").update(payload).digest();
  return hash.readUInt32BE(0) ^ hash.readUInt32BE(4);
}

function yearRange(bucket: EraBucket): string {
  if (bucket.years.length === 0) return "the beginning";
  if (bucket.years.length === 1) return bucket.years[0];
  return `${bucket.years[0]}–${bucket.years[bucket.years.length - 1]}`;
}

function langList(bucket: EraBucket): string {
  if (bucket.languages.length === 0) return "an idea and a terminal";
  if (bucket.languages.length === 1) return bucket.languages[0];
  if (bucket.languages.length === 2) {
    return `${bucket.languages[0]} and ${bucket.languages[1]}`;
  }
  return `${bucket.languages.slice(0, -1).join(", ")}, and ${bucket.languages.at(-1)}`;
}

function reposForYears(
  data: DevStoryData,
  years: string[],
): EraContext["repos"] {
  const source =
    years.length === 0
      ? data.repos.slice(0, 2)
      : data.repos.filter((repo) => years.includes(repo.createdAt.slice(0, 4)));

  return source.slice(0, 4).map((repo) => ({
    name: repo.name,
    desc: repo.description,
    stars: repo.stars,
    lang: repo.language,
  }));
}

function milestoneForYears(
  data: DevStoryData,
  years: string[],
): EraContext["milestone"] {
  if (years.length === 0) return data.milestones[0] ?? null;

  const yearSet = new Set(years);
  const match = data.milestones.find((m) => yearSet.has(m.date.slice(0, 4)));
  return match ?? data.milestones[0] ?? null;
}

function buildBuckets(data: DevStoryData): EraBucket[] {
  const byYear = data.languagesByYear;
  if (byYear.length === 0) return [{ years: [], languages: [] }];

  const target = Math.min(
    computeTargetEraCount(data),
    Math.max(byYear.length, 1),
  );
  const perBucket = Math.ceil(byYear.length / target);
  const buckets: EraBucket[] = [];

  for (let i = 0; i < byYear.length; i += perBucket) {
    const slice = byYear.slice(i, i + perBucket);
    const langCounts = new Map<string, number>();

    for (const year of slice) {
      for (const lang of year.languages) {
        langCounts.set(lang.language, (langCounts.get(lang.language) ?? 0) + lang.repoCount);
      }
    }

    buckets.push({
      years: slice.map((year) => year.year),
      languages: [...langCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([language]) => language)
        .slice(0, 3),
    });
  }

  return buckets;
}

const ERA_NAME_MAKERS: Array<(ctx: EraContext) => string> = [
  (ctx) => `The ${ctx.primaryLang} Chapter`,
  (ctx) => `When ${ctx.repos[0]?.name ?? "the first repo"} Took Shape`,
  (ctx) => `Notes from ${ctx.range}`,
  (ctx) => `The ${ctx.startYear} Experiment`,
  (ctx) => `Building in ${ctx.primaryLang}`,
  (ctx) => `The ${ctx.repos[0]?.name ?? "side project"} Season`,
  (ctx) => `Between ${ctx.startYear} and ${ctx.endYear}`,
  (ctx) => `The ${ctx.primaryLang} Stretch`,
  (ctx) => `Shipping ${ctx.repos[0]?.name ?? "ideas"}`,
  (ctx) => `The ${ctx.range} Build Log`,
];

const ERA_DESCRIPTION_MAKERS: Array<(ctx: EraContext) => string> = [
  (ctx) => {
    const repo = ctx.repos[0];
    const repoBit = repo
      ? `${repo.name}${repo.desc ? ` — "${repo.desc}"` : ""}`
      : "a fresh repository";
    return `${ctx.username} spent ${ctx.range} inside ${ctx.langs}, turning ${repoBit} into something real.`;
  },
  (ctx) => {
    const milestone = ctx.milestone;
    const commitBit = milestone
      ? `A commit from ${milestone.date} still reads like a breadcrumb: "${milestone.message}".`
      : "Commits stacked up faster than documentation.";
    return `This was a ${ctx.langs} phase for ${ctx.username}, with repos appearing across ${ctx.range}. ${commitBit}`;
  },
  (ctx) => {
    const starred = ctx.repos.find((repo) => repo.stars > 0);
    const starBit = starred
      ? `${starred.name} picked up ${starred.stars} star${starred.stars === 1 ? "" : "s"} — proof someone noticed.`
      : "Most of the work stayed private, which is its own kind of honesty.";
    return `${ctx.username} leaned into ${ctx.langs} during ${ctx.range}. ${starBit}`;
  },
  (ctx) => {
    const names = ctx.repos.map((repo) => repo.name).slice(0, 3);
    const repoList = names.length > 0 ? names.join(", ") : "unnamed experiments";
    return `Between ${ctx.startYear} and ${ctx.endYear}, the keyboard kept finding ${ctx.langs}. Repos like ${repoList} mapped where curiosity went next.`;
  },
  (ctx) => {
    const repo = ctx.repos[1] ?? ctx.repos[0];
    return repo
      ? `${ctx.username} circled ${ctx.langs} while ${repo.name} demanded attention in ${ctx.range} — less theory, more wiring things together.`
      : `${ctx.username} treated ${ctx.langs} as a workshop language through ${ctx.range}, learning by shipping small things that almost worked.`;
  },
  (ctx) => {
    const milestone = ctx.milestone;
    return milestone
      ? `In ${ctx.range}, ${ctx.username} worked mostly in ${ctx.langs}. ${milestone.repo} carries an early fingerprint: "${milestone.message}".`
      : `${ctx.username}'s ${ctx.range} archive is written in ${ctx.langs} — uneven, alive, and unmistakably theirs.`;
  },
  (ctx) => {
    const repo = ctx.repos[0];
    const langShift =
      ctx.repos.some((item) => item.lang && item.lang !== ctx.primaryLang)
        ? "Languages overlapped here; nothing stayed tidy for long."
        : `${ctx.primaryLang} held the center.`;
    return `${ctx.username} pushed through ${ctx.range}${repo ? ` with ${repo.name} as a recurring anchor` : ""}. ${langShift}`;
  },
  (ctx) => {
    const desc = ctx.repos.find((repo) => repo.desc)?.desc;
    return desc
      ? `A note in the repo README still frames the mood: "${desc}". ${ctx.username} was building in ${ctx.langs} across ${ctx.range}.`
      : `${ctx.username} kept returning to ${ctx.langs} between ${ctx.startYear} and ${ctx.endYear}, treating each repo like a sketch before the next idea arrived.`;
  },
];

const TITLE_MAKERS: Array<(ctx: StoryContext) => string> = [
  (ctx) =>
    ctx.firstLang && ctx.lastLang && ctx.firstLang !== ctx.lastLang
      ? `From ${ctx.firstLang} to ${ctx.lastLang}`
      : `${ctx.username}'s Developer Journey`,
  (ctx) =>
    ctx.oldestRepo && ctx.newestRepo
      ? `${ctx.oldestRepo} to ${ctx.newestRepo}`
      : `${ctx.username} in Commits`,
  (ctx) =>
    ctx.topRepo
      ? `The ${ctx.topRepo.name} Arc`
      : `${ctx.username}'s Build History`,
  (ctx) =>
    ctx.yearSpan > 1
      ? `${ctx.yearSpan} Years of ${ctx.firstLang ?? "Code"}`
      : `The ${ctx.firstEraName}`,
  (ctx) => `${ctx.username} and the ${ctx.lastEraName}`,
];

const SUMMARY_MAKERS: Array<(ctx: StoryContext) => string> = [
  (ctx) =>
    `${ctx.username} shaped ${ctx.repoCount} public repos${ctx.yearSpan > 0 ? ` across ${ctx.yearSpan} year${ctx.yearSpan === 1 ? "" : "s"}` : ""}, moving from ${ctx.firstEraName.toLowerCase()} into ${ctx.lastEraName.toLowerCase()} with ${ctx.firstLang && ctx.lastLang && ctx.firstLang !== ctx.lastLang ? `a shift from ${ctx.firstLang} toward ${ctx.lastLang}` : `${ctx.firstLang ?? "curiosity"} as the through-line`}.`,
  (ctx) =>
    ctx.topRepo
      ? `The timeline reads like a builder who kept showing up: ${ctx.repoCount} repos, ${ctx.totalStars} stars gathered along the way, and ${ctx.topRepo.name} standing out as the loudest room in the archive.`
      : `This is a story told in repositories — ${ctx.repoCount} of them — where each era changes tone even when the tools stay familiar.`,
  (ctx) =>
    ctx.firstCommit
      ? `It starts with "${ctx.firstCommit.message}" in ${ctx.firstCommit.repo} and unfolds into ${ctx.lastEraName.toLowerCase()}. ${ctx.username} did not follow a straight line; they followed the work.`
      : `${ctx.username}'s GitHub history is less a résumé than a diary written in commits, languages, and the names of repos that survived long enough to matter.`,
  (ctx) =>
    ctx.bio
      ? `${ctx.username} — "${ctx.bio}" — left that intention all over the graph: ${ctx.repoCount} repos, ${ctx.firstEraName.toLowerCase()}, then ${ctx.lastEraName.toLowerCase()}.`
      : `From ${ctx.firstEraName.toLowerCase()} to ${ctx.lastEraName.toLowerCase()}, ${ctx.username} built in public often enough that the pattern is clear: learn, ship, revise, repeat.`,
];

const CLOSING_MAKERS: Array<(ctx: StoryContext) => string> = [
  (ctx) =>
    ctx.lastCommit
      ? `The latest breadcrumb — "${ctx.lastCommit.message}" in ${ctx.lastCommit.repo} — is still there. So is the next blank commit.`
      : `The log is still open. The next era already has a name waiting for it.`,
  (ctx) =>
    ctx.topRepo
      ? `${ctx.topRepo.name} still glows brightest in the archive, but the story did not stop there — ${ctx.username} keeps writing new chapters in code.`
      : `${ctx.username} has already outgrown several versions of themselves; the next one starts with whatever gets pushed tomorrow.`,
  (ctx) =>
    ctx.firstLang && ctx.lastLang && ctx.firstLang !== ctx.lastLang
      ? `${ctx.firstLang} did not disappear — it became the foundation under ${ctx.lastLang}. That is a real arc, and it is still moving.`
      : `Every era on this timeline is evidence of attention paid when nobody was required to applaud. That habit is the whole point.`,
  (ctx) =>
    ctx.oldestRepo
      ? `${ctx.oldestRepo} is still in the rearview, but the road ahead is unwritten — and ${ctx.username} clearly likes roads.`
      : `The invisible hours are visible now. What comes next is the interesting part.`,
];

const ARCHETYPE_MAKERS: Array<(ctx: StoryContext) => string> = [
  (ctx) =>
    ctx.firstLang && ctx.lastLang && ctx.firstLang !== ctx.lastLang
      ? "The Polyglot Explorer"
      : "The Focused Builder",
  (ctx) => (ctx.repoCount > 25 ? "The Prolific Architect" : "The Steady Crafter"),
  (ctx) => (ctx.totalStars > 50 ? "The Noticed Maker" : "The Quiet Shipper"),
  (ctx) => (ctx.yearSpan > 6 ? "The Long-Game Developer" : "The Fast Learner"),
  (ctx) => (ctx.topRepo && ctx.topRepo.stars > 10 ? "The Flagship Builder" : "The Iterative Tinkerer"),
];

function buildEraContext(
  data: DevStoryData,
  bucket: EraBucket,
): EraContext {
  const range = yearRange(bucket);
  const startYear = bucket.years[0] ?? "then";
  const endYear = bucket.years.at(-1) ?? startYear;
  const languages = bucket.languages;

  return {
    username: data.username,
    range,
    startYear,
    endYear,
    langs: langList(bucket),
    primaryLang: languages[0] ?? "code",
    repos: reposForYears(data, bucket.years),
    milestone: milestoneForYears(data, bucket.years),
  };
}

function buildStoryContext(
  data: DevStoryData,
  eras: Era[],
): StoryContext {
  const byYear = data.languagesByYear;
  const starred = [...data.repos].sort((a, b) => b.stars - a.stars)[0];

  return {
    username: data.username,
    repoCount: data.totals.repoCount,
    totalStars: data.totals.totalStars,
    yearSpan: byYear.length,
    firstLang: byYear[0]?.languages[0]?.language ?? null,
    lastLang: byYear.at(-1)?.languages[0]?.language ?? null,
    firstEraName: eras[0]?.name ?? "The First Commits",
    lastEraName: eras.at(-1)?.name ?? "The Present",
    oldestRepo: data.totals.oldestRepo,
    newestRepo: data.totals.newestRepo,
    topRepo: starred ? { name: starred.name, stars: starred.stars } : null,
    firstCommit: data.milestones[0]
      ? { message: data.milestones[0].message, repo: data.milestones[0].repo }
      : null,
    lastCommit: data.latestMilestones[0]
      ? {
          message: data.latestMilestones[0].message,
          repo: data.latestMilestones[0].repo,
        }
      : null,
    bio: data.profile.bio,
  };
}

function buildMockStory(data: DevStoryData, salt: number): DevStory {
  const rng = new SeededRng(seedFromData(data, salt));
  const buckets = buildBuckets(data);
  const tokens = rng.pickUnique(TOKEN_IDS, buckets.length);

  const nameMakers = rng.pickUnique(ERA_NAME_MAKERS, buckets.length);
  const descriptionMakers = rng.pickUnique(
    ERA_DESCRIPTION_MAKERS,
    buckets.length,
  );

  const eras: Era[] = buckets.map((bucket, index) => {
    const eraContext = buildEraContext(data, bucket);

    return {
      year: bucket.years.length === 0 ? "the beginning" : yearRange(bucket),
      name: nameMakers[index](eraContext),
      description: descriptionMakers[index](eraContext),
      keyLanguages: bucket.languages,
      token: tokens[index] ?? TOKEN_IDS[index % TOKEN_IDS.length],
    };
  });

  const storyContext = buildStoryContext(data, eras);

  return {
    title: rng.pick(TITLE_MAKERS)(storyContext),
    summary: rng.pick(SUMMARY_MAKERS)(storyContext),
    eras,
    closing: rng.pick(CLOSING_MAKERS)(storyContext),
    archetype: rng.pick(ARCHETYPE_MAKERS)(storyContext),
  };
}

export function generateMockStory(data: DevStoryData): DevStory {
  for (let attempt = 0; attempt < 4; attempt++) {
    const story = buildMockStory(data, attempt);
    if (!needsVarietyRetry(story)) {
      return story;
    }
  }

  return buildMockStory(data, 99);
}
