import type { DevStoryData } from "./aggregate";
import type { RepoCommitData } from "@/lib/github/commits";
import type { RepoSnapshot } from "@/lib/github/repos";
import {
  normalizeBrainSnapshot,
  snapshotToDevStoryData,
  type StoryDataSnapshot,
} from "./minify";

export type { StoryDataSnapshot };

export { normalizeBrainSnapshot, snapshotToDevStoryData, summarizeStoryData } from "./minify";

/** Minimal shape check before trusting client-sent brain data. */
export function isBrainSnapshot(value: unknown): value is StoryDataSnapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as StoryDataSnapshot;
  return (
    typeof s.username === "string" &&
    typeof s.name === "string" &&
    s.totals !== null &&
    typeof s.totals === "object" &&
    typeof s.totals.repos === "number" &&
    Array.isArray(s.repos) &&
    Array.isArray(s.milestones)
  );
}

export function parseBrainSnapshot(value: unknown): StoryDataSnapshot | null {
  if (!isBrainSnapshot(value)) return null;
  return normalizeBrainSnapshot(value);
}

export function brainMatchesUsername(
  brain: StoryDataSnapshot,
  username: string,
): boolean {
  return brain.username.toLowerCase() === username.toLowerCase();
}

export function devStoryDataFromBrain(brain: StoryDataSnapshot): DevStoryData {
  return snapshotToDevStoryData(normalizeBrainSnapshot(brain));
}

export function probedRepoNames(brain: StoryDataSnapshot): Set<string> {
  const names = new Set<string>();
  for (const repo of brain.repos) {
    if (repo.probed) names.add(repo.name);
  }
  for (const sample of brain.commitSamples) {
    names.add(sample.repo);
  }
  return names;
}

export function repoCommitsFromBrain(
  brain: StoryDataSnapshot,
): Record<string, RepoCommitData> {
  const out: Record<string, RepoCommitData> = {};
  for (const sample of brain.commitSamples) {
    out[sample.repo] = {
      totalCommits: sample.totalCommits,
      firstCommit: sample.first
        ? {
            repo: sample.repo,
            sha: sample.first.sha,
            date: sample.first.date,
            message: sample.first.msg,
          }
        : null,
      recentCommits: sample.recent.map((c) => ({
        repo: sample.repo,
        sha: c.sha,
        date: c.date,
        message: c.msg,
      })),
    };
  }
  return out;
}

export function repoSnapshotsFromBrain(brain: StoryDataSnapshot): RepoSnapshot[] {
  return brain.repos.map((r) => ({
    name: r.name,
    description: r.desc,
    createdAt: r.created.length === 10 ? `${r.created}T00:00:00Z` : r.created,
    defaultBranch: "HEAD",
    language: r.lang,
    size: 0,
    stars: r.stars,
    forks: r.forks ?? 0,
    archived: r.archived ?? false,
    fork: false,
  }));
}
