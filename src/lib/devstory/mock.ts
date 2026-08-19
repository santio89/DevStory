import type { DevStoryData } from "./aggregate";
import type { DevStory, Era } from "./story";

const ERA_TEMPLATES = [
  "The Hello World Era",
  "The Foundation Era",
  "The Framework Awakening",
  "The Language Shift",
  "The Mastery Era",
];

export function generateMockStory(data: DevStoryData): DevStory {
  const byYear = data.languagesByYear;

  const buckets: { years: string[]; languages: string[] }[] = [];
  if (byYear.length === 0) {
    buckets.push({ years: [], languages: [] });
  } else {
    const target = Math.min(5, Math.max(1, byYear.length));
    const perBucket = Math.ceil(byYear.length / target);
    for (let i = 0; i < byYear.length; i += perBucket) {
      const slice = byYear.slice(i, i + perBucket);
      const langCounts = new Map<string, number>();
      for (const year of slice) {
        for (const lang of year.languages) {
          langCounts.set(lang.language, (langCounts.get(lang.language) ?? 0) + lang.repoCount);
        }
      }
      const languages = [...langCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([language]) => language)
        .slice(0, 3);
      buckets.push({
        years: slice.map((year) => year.year),
        languages,
      });
    }
  }

  const firstMilestone = data.milestones[0];

  const eras: Era[] = buckets.map((bucket, index) => {
    const yearLabel =
      bucket.years.length === 0
        ? "the beginning"
        : bucket.years.length === 1
          ? bucket.years[0]
          : `${bucket.years[0]}-${bucket.years[bucket.years.length - 1]}`;

    const langList =
      bucket.languages.length > 0
        ? bucket.languages.join(", ")
        : "an idea and a terminal";

    const isFirst = index === 0;
    const anchor = isFirst && firstMilestone
      ? ` The first commit on record, "${firstMilestone.message}", lives here.`
      : "";

    return {
      year: yearLabel,
      name: ERA_TEMPLATES[index % ERA_TEMPLATES.length],
      description: `Working primarily in ${langList}${bucket.years.length ? ` across ${bucket.years[0]}${bucket.years.length > 1 ? `–${bucket.years[bucket.years.length - 1]}` : ""}` : ""}, ${data.username} was figuring things out one repo at a time.${anchor}`,
      keyLanguages: bucket.languages,
    };
  });

  const firstLang = byYear[0]?.languages[0]?.language;
  const lastLang = byYear[byYear.length - 1]?.languages[0]?.language;
  const repoCount = data.totals.repoCount;
  const span =
    byYear.length > 0
      ? `over ${byYear.length} year${byYear.length === 1 ? "" : "s"}`
      : "";

  const title =
    firstLang && lastLang && firstLang !== lastLang
      ? `From ${firstLang} to ${lastLang}`
      : `${data.username}'s Developer Journey`;

  const summary = `Across ${repoCount} repos${span ? ` ${span}` : ""}, ${data.username} moved through ${eras.length} distinct eras — from ${eras[0]?.name.toLowerCase() ?? "first commits"} to ${eras[eras.length - 1]?.name.toLowerCase() ?? "where they are now"} — each one a stepping stone in the making of a developer.`;

  return { title, summary, eras };
}