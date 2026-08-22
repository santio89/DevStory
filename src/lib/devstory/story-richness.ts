import type { DevStoryData } from "./aggregate";

export const MIN_ERAS = 3;
export const MAX_ERAS = 10;

/** How many timeline eras the biographer should aim for given this GitHub history. */
export function computeTargetEraCount(data: DevStoryData): number {
  const activeYears = data.languagesByYear.length;
  const repos = data.totals.repoCount;
  const spanYears =
    activeYears > 0
      ? Number(data.languagesByYear.at(-1)!.year) -
        Number(data.languagesByYear[0]!.year) +
        1
      : 1;

  let target = MIN_ERAS;

  if (activeYears >= 2 || spanYears >= 2) target = 4;
  if (activeYears >= 4 || spanYears >= 4) target = 5;
  if (activeYears >= 6 || spanYears >= 6) target = 7;
  if (activeYears >= 8 || spanYears >= 8) target = 8;
  if (activeYears >= 10 || spanYears >= 10) target = 9;
  if ((activeYears >= 12 || spanYears >= 12) && repos >= 10) {
    target = MAX_ERAS;
  }

  if (repos >= 25) target = Math.min(MAX_ERAS, target + 1);
  if (repos >= 50) target = Math.min(MAX_ERAS, target + 1);
  if (data.totals.commitsAnalyzed >= 500) {
    target = Math.min(MAX_ERAS, target + 1);
  }

  return Math.min(MAX_ERAS, Math.max(MIN_ERAS, target));
}

export function eraCountGuidance(data: DevStoryData): string {
  const target = computeTargetEraCount(data);
  const activeYears = data.languagesByYear.length;
  const repos = data.totals.repoCount;
  const commits = data.totals.commitsAnalyzed;
  const floor = Math.max(MIN_ERAS, target - 1);
  const ceiling = Math.min(MAX_ERAS, target + 1);

  if (target <= 4) {
    return `This history is relatively compact (${activeYears} active years, ${repos} public repos). Write about ${target} eras (${MIN_ERAS}–${ceiling} is acceptable). Do not pad with invented chapters.`;
  }

  if (target >= 8) {
    return `This is a long, rich history (${activeYears} active years spanning multiple chapters, ${repos} public repos, ~${commits} commits sampled). Write ${target} eras (${floor}–${MAX_ERAS}). Do NOT collapse this into only 3–4 vague decades — the timeline should feel as deep as the data.`;
  }

  return `Write about ${target} distinct eras (${floor}–${ceiling} if the years group naturally). Match the granularity to the data — more years and repos deserve more chapters, not fewer.`;
}
