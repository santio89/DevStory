import type { CommitMilestone } from "@/lib/github/commits";
import type { RepoSnapshot } from "@/lib/github/repos";

/** Max items shown in "Earliest commits" and passed to the biographer as opening-era anchors. */
export const EARLIEST_MILESTONE_LIMIT = 5;

/** Max items shown in "Latest commits". */
export const LATEST_MILESTONE_LIMIT = 5;

/** Era window used for both opening and closing commit picks. */
const ERA_WINDOW_MS = 2 * 365.25 * 24 * 60 * 60 * 1000;

type RepoCommitSlice = {
  firstCommit: CommitMilestone | null;
  recentCommits: CommitMilestone[];
};

function dedupeCommits(
  commits: CommitMilestone[],
  limit: number,
): CommitMilestone[] {
  const seen = new Set<string>();
  const out: CommitMilestone[] = [];
  for (const m of commits) {
    const key = `${m.repo}:${m.sha}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

function firstCommitsByDate(
  repoCommits: Record<string, { firstCommit: CommitMilestone | null }>,
): CommitMilestone[] {
  return Object.values(repoCommits)
    .map((c) => c.firstCommit)
    .filter((c): c is CommitMilestone => c !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function recentCommitsByDate(
  repoCommits: Record<string, RepoCommitSlice>,
  descending = true,
): CommitMilestone[] {
  const all = Object.values(repoCommits).flatMap((c) => c.recentCommits);
  return all.sort((a, b) =>
    descending ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
  );
}

function reposInOpeningEra(repos: RepoSnapshot[]): Set<string> {
  const sortedRepos = [...repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const careerStartMs = new Date(sortedRepos[0].createdAt).getTime();

  return new Set(
    sortedRepos
      .filter(
        (r) =>
          new Date(r.createdAt).getTime() - careerStartMs <= ERA_WINDOW_MS,
      )
      .map((r) => r.name),
  );
}

function reposInClosingEra(repos: RepoSnapshot[]): Set<string> {
  const sortedRepos = [...repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const careerEndMs = new Date(sortedRepos.at(-1)!.createdAt).getTime();

  return new Set(
    sortedRepos
      .filter(
        (r) => careerEndMs - new Date(r.createdAt).getTime() <= ERA_WINDOW_MS,
      )
      .map((r) => r.name),
  );
}

/**
 * First commit per repo, limited to the developer's opening era — not every probed repo.
 * Probing includes recent repos for AI context; milestones are only for career beginnings.
 */
export function buildEarliestMilestones(
  repos: RepoSnapshot[],
  repoCommits: Record<string, { firstCommit: CommitMilestone | null }>,
  limit = EARLIEST_MILESTONE_LIMIT,
): CommitMilestone[] {
  if (repos.length === 0) return [];

  const beginningRepoNames = reposInOpeningEra(repos);

  const fromOpeningRepos = Object.entries(repoCommits)
    .filter(([name]) => beginningRepoNames.has(name))
    .map(([, c]) => c.firstCommit)
    .filter((c): c is CommitMilestone => c !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (fromOpeningRepos.length >= limit) {
    return fromOpeningRepos.slice(0, limit);
  }

  const allFirst = firstCommitsByDate(repoCommits);
  if (allFirst.length === 0) return fromOpeningRepos;

  const anchorMs = new Date(allFirst[0].date).getTime();
  const withinOpeningEra = allFirst.filter(
    (m) => new Date(m.date).getTime() - anchorMs <= ERA_WINDOW_MS,
  );

  const seen = new Set(fromOpeningRepos.map((m) => `${m.repo}:${m.sha}`));
  const merged = [...fromOpeningRepos];
  for (const m of withinOpeningEra) {
    if (merged.length >= limit) break;
    const key = `${m.repo}:${m.sha}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(m);
    }
  }

  return merged.slice(0, limit);
}

/**
 * Recent commits from the developer's closing era — not their career beginnings.
 */
export function buildLatestMilestones(
  repos: RepoSnapshot[],
  repoCommits: Record<string, RepoCommitSlice>,
  limit = LATEST_MILESTONE_LIMIT,
): CommitMilestone[] {
  if (repos.length === 0) return [];

  const closingRepoNames = reposInClosingEra(repos);

  const fromClosingRepos = dedupeCommits(
    Object.entries(repoCommits)
      .filter(([name]) => closingRepoNames.has(name))
      .flatMap(([, c]) => c.recentCommits)
      .sort((a, b) => b.date.localeCompare(a.date)),
    limit,
  );

  if (fromClosingRepos.length >= limit) {
    return fromClosingRepos;
  }

  const allRecent = recentCommitsByDate(repoCommits, true);
  if (allRecent.length === 0) return fromClosingRepos;

  const anchorMs = new Date(allRecent[0].date).getTime();
  const withinClosingEra = allRecent.filter(
    (m) => anchorMs - new Date(m.date).getTime() <= ERA_WINDOW_MS,
  );

  const seen = new Set(fromClosingRepos.map((m) => `${m.repo}:${m.sha}`));
  const merged = [...fromClosingRepos];
  for (const m of withinClosingEra) {
    if (merged.length >= limit) break;
    const key = `${m.repo}:${m.sha}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(m);
    }
  }

  return merged.slice(0, limit);
}
