import { createHash } from "node:crypto";
import { createGitHubClient } from "@/lib/github/client";
import {
  fetchRepoCommits,
  type CommitMilestone,
  type RepoCommitData,
} from "@/lib/github/commits";
import { fetchRepos, type RepoSnapshot } from "@/lib/github/repos";

const OLDEST_REPOS_TO_PROBE = 5;
const CACHE_TTL_MS = 5 * 60 * 1000;

const dataCache = new Map<string, { data: DevStoryData; expiresAt: number }>();

function cacheKey(accessToken: string): string {
  return createHash("sha256").update(accessToken).digest("hex");
}

export type LanguageStat = { language: string; repoCount: number };
export type LanguageYear = { year: string; languages: LanguageStat[] };

export type DevStoryData = {
  username: string;
  name: string;
  avatarUrl: string;
  profile: {
    bio: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    createdAt: string;
    publicRepos: number;
    followers: number;
    following: number;
  };
  totals: {
    repoCount: number;
    totalStars: number;
    totalForks: number;
    commitsAnalyzed: number;
    oldestRepo: string | null;
    oldestRepoDate: string | null;
    newestRepo: string | null;
    newestRepoDate: string | null;
  };
  languages: LanguageStat[];
  languagesByYear: LanguageYear[];
  repos: RepoSnapshot[];
  milestones: CommitMilestone[];
  repoCommits: Record<string, RepoCommitData>;
};

function countLanguages(
  repos: RepoSnapshot[],
): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([language, repoCount]) => ({ language, repoCount }))
    .sort((a, b) => b.repoCount - a.repoCount);
}

function groupLanguagesByYear(repos: RepoSnapshot[]): LanguageYear[] {
  const byYear = new Map<string, Map<string, number>>();
  for (const repo of repos) {
    if (!repo.language) continue;
    const year = repo.createdAt.slice(0, 4);
    if (!year) continue;
    const langs = byYear.get(year) ?? new Map<string, number>();
    langs.set(repo.language, (langs.get(repo.language) ?? 0) + 1);
    byYear.set(year, langs);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, langs]) => ({
      year,
      languages: [...langs.entries()]
        .map(([language, repoCount]) => ({ language, repoCount }))
        .sort((a, b) => b.repoCount - a.repoCount),
    }));
}

export type StoryPreviewData = {
  username: string;
  totals: {
    repoCount: number;
    totalStars: number;
    commitsAnalyzed: number;
    oldestRepoDate: string | null;
  };
  languagesByYear: LanguageYear[];
  milestones: CommitMilestone[];
};

export function toPreviewData(data: DevStoryData): StoryPreviewData {
  return {
    username: data.username,
    totals: {
      repoCount: data.totals.repoCount,
      totalStars: data.totals.totalStars,
      commitsAnalyzed: data.totals.commitsAnalyzed,
      oldestRepoDate: data.totals.oldestRepoDate,
    },
    languagesByYear: data.languagesByYear,
    milestones: data.milestones,
  };
}

export async function buildDevStoryData(
  accessToken: string,
  options: { forceRefresh?: boolean } = {},
): Promise<DevStoryData> {
  const key = cacheKey(accessToken);
  const cached = dataCache.get(key);
  if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const octokit = createGitHubClient(accessToken);
  const { data: user } = await octokit.rest.users.getAuthenticated();

  const repos = await fetchRepos(accessToken);
  const oldestRepos = [...repos]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, OLDEST_REPOS_TO_PROBE);

  const repoCommits: Record<string, RepoCommitData> = {};
  for (const repo of oldestRepos) {
    repoCommits[repo.name] = await fetchRepoCommits(
      octokit,
      user.login,
      repo.name,
      repo.defaultBranch,
    );
  }

  const milestones = Object.values(repoCommits)
    .map((c) => c.firstCommit)
    .filter((c): c is CommitMilestone => c !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totals = {
    repoCount: repos.length,
    totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
    commitsAnalyzed: Object.values(repoCommits).reduce(
      (sum, c) => sum + c.totalCommits,
      0,
    ),
    oldestRepo: repos[0]?.name ?? null,
    oldestRepoDate: repos[0]?.createdAt ?? null,
    newestRepo: repos[repos.length - 1]?.name ?? null,
    newestRepoDate: repos[repos.length - 1]?.createdAt ?? null,
  };

  const data: DevStoryData = {
    username: user.login,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    profile: {
      bio: user.bio,
      location: user.location,
      company: user.company,
      blog: user.blog,
      createdAt: user.created_at ?? "",
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
    },
    totals,
    languages: countLanguages(repos),
    languagesByYear: groupLanguagesByYear(repos),
    repos,
    milestones,
    repoCommits,
  };

  dataCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
