import type { RepoSnapshot } from "./repos";

/** Default for quick preview refresh paths. */
export const DEFAULT_COMMIT_PROBE = 5;

/** Story generation + preview — rich commit sampling. */
export const STORY_COMMIT_PROBE = 20;

/** Chat biographer — deepest commit sampling. */
export const CHAT_COMMIT_PROBE = 24;

const PROBE_BATCH_SIZE = 10;

export function selectReposForCommitProbe(
  repos: RepoSnapshot[],
  limit: number,
  question?: string,
): RepoSnapshot[] {
  if (limit <= 0 || repos.length === 0) return [];

  const selected: RepoSnapshot[] = [];
  const seen = new Set<string>();
  const add = (repo: RepoSnapshot) => {
    if (seen.has(repo.name)) return;
    seen.add(repo.name);
    selected.push(repo);
  };

  if (question?.trim()) {
    const q = question.toLowerCase();
    for (const repo of repos) {
      if (q.includes(repo.name.toLowerCase())) add(repo);
    }
  }

  const slotsLeft = () => limit - selected.length;
  const byAge = [...repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const byStars = [...repos].sort((a, b) => b.stars - a.stars);

  for (const repo of byAge.slice(0, 8)) {
    if (slotsLeft() <= 0) break;
    add(repo);
  }
  for (const repo of byStars.slice(0, 10)) {
    if (slotsLeft() <= 0) break;
    add(repo);
  }
  for (const repo of byAge.slice(-5)) {
    if (slotsLeft() <= 0) break;
    add(repo);
  }

  return selected.slice(0, limit);
}

export async function probeCommitsInBatches<T>(
  repos: RepoSnapshot[],
  probe: (repo: RepoSnapshot) => Promise<T>,
): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  for (let i = 0; i < repos.length; i += PROBE_BATCH_SIZE) {
    const batch = repos.slice(i, i + PROBE_BATCH_SIZE);
    const pairs = await Promise.all(
      batch.map(async (repo) => [repo.name, await probe(repo)] as const),
    );
    for (const [name, data] of pairs) {
      results.set(name, data);
    }
  }
  return results;
}
