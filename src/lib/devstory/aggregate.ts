import { createGitHubClient } from "@/lib/github/client";
import {
  fetchRepoCommits,
  type CommitMilestone,
  type RepoCommitData,
} from "@/lib/github/commits";
import {
  DEFAULT_COMMIT_PROBE,
  probeCommitsInBatches,
  selectReposForCommitProbe,
} from "@/lib/github/probe-repos";
import {
  fetchReposForUser,
  type RepoSnapshot,
} from "@/lib/github/repos";
import { normalizeGitHubUsername } from "@/lib/github/username";

const CACHE_TTL_MS = 5 * 60 * 1000;

const dataCache = new Map<string, { data: DevStoryData; expiresAt: number }>();

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

function countLanguages(repos: RepoSnapshot[]): LanguageStat[] {
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
  usernameInput: string,
  options: {
    forceRefresh?: boolean;
    commitProbeLimit?: number;
    questionForProbe?: string;
  } = {},
): Promise<DevStoryData> {
  const username = normalizeGitHubUsername(usernameInput).toLowerCase();
  const probeLimit = options.commitProbeLimit ?? DEFAULT_COMMIT_PROBE;
  const cached = dataCache.get(username);

  if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) {
    const merged = await enrichCommitProbes(
      cached.data,
      probeLimit,
      options.questionForProbe,
    );
    if (merged !== cached.data) {
      dataCache.set(username, {
        data: merged,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    return merged;
  }

  const octokit = createGitHubClient();
  const { data: user } = await octokit.rest.users.getByUsername({ username });

  const repos = await fetchReposForUser(user.login, octokit);
  const repoCommits = await probeCommitsForRepos(
    octokit,
    user.login,
    repos,
    probeLimit,
    options.questionForProbe,
  );

  const data = assembleDevStoryData(user, repos, repoCommits);

  dataCache.set(username, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function enrichCommitProbes(
  data: DevStoryData,
  probeLimit: number,
  question?: string,
): Promise<DevStoryData> {
  const toProbe = selectReposForCommitProbe(
    data.repos,
    probeLimit,
    question,
  ).filter((repo) => !data.repoCommits[repo.name]);

  if (toProbe.length === 0) return data;

  const octokit = createGitHubClient();
  const added = await probeCommitsForRepos(
    octokit,
    data.username,
    toProbe,
    toProbe.length,
  );

  const repoCommits = { ...data.repoCommits, ...added };
  return assembleDevStoryDataFromParts(data, repoCommits);
}

async function probeCommitsForRepos(
  octokit: ReturnType<typeof createGitHubClient>,
  owner: string,
  repos: RepoSnapshot[],
  limit: number,
  question?: string,
): Promise<Record<string, RepoCommitData>> {
  const targets = selectReposForCommitProbe(repos, limit, question);
  const probed = await probeCommitsInBatches(targets, (repo) =>
    fetchRepoCommits(octokit, owner, repo.name, repo.defaultBranch),
  );
  return Object.fromEntries(probed.entries());
}

function assembleDevStoryDataFromParts(
  base: DevStoryData,
  repoCommits: Record<string, RepoCommitData>,
): DevStoryData {
  const milestones = Object.values(repoCommits)
    .map((c) => c.firstCommit)
    .filter((c): c is CommitMilestone => c !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    ...base,
    milestones,
    totals: {
      ...base.totals,
      commitsAnalyzed: Object.values(repoCommits).reduce(
        (sum, c) => sum + c.totalCommits,
        0,
      ),
    },
    repoCommits,
  };
}

function assembleDevStoryData(
  user: Awaited<
    ReturnType<ReturnType<typeof createGitHubClient>["rest"]["users"]["getByUsername"]>
  >["data"],
  repos: RepoSnapshot[],
  repoCommits: Record<string, RepoCommitData>,
): DevStoryData {
  const milestones = Object.values(repoCommits)
    .map((c) => c.firstCommit)
    .filter((c): c is CommitMilestone => c !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedRepos = [...repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  return {
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
    totals: {
      repoCount: repos.length,
      totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
      totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
      commitsAnalyzed: Object.values(repoCommits).reduce(
        (sum, c) => sum + c.totalCommits,
        0,
      ),
      oldestRepo: sortedRepos[0]?.name ?? null,
      oldestRepoDate: sortedRepos[0]?.createdAt ?? null,
      newestRepo: sortedRepos[sortedRepos.length - 1]?.name ?? null,
      newestRepoDate: sortedRepos[sortedRepos.length - 1]?.createdAt ?? null,
    },
    languages: countLanguages(repos),
    languagesByYear: groupLanguagesByYear(repos),
    repos,
    milestones,
    repoCommits,
  };
}
