import type { DevStoryData } from "./aggregate";
import type { StoryPreviewData } from "./aggregate";
import type { RepoCommitData } from "@/lib/github/commits";
import type { RepoSnapshot } from "@/lib/github/repos";
import { BRAIN_COMMIT_PROBE } from "@/lib/github/probe-repos";
import { buildNarrativeFingerprint } from "./narrative-context";

const MAX_SNAPSHOT_REPOS = 250;
const MAX_MINIFY_REPOS = 250;

export type BrainCommitSample = {
  repo: string;
  totalCommits: number;
  first: { sha: string; date: string; msg: string } | null;
  recent: { sha: string; date: string; msg: string }[];
};

export type StoryDataSnapshot = {
  username: string;
  name: string;
  avatarUrl?: string | null;
  memberSince: string | null;
  profile: {
    bio: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    followers: number;
    following: number;
  };
  totals: {
    repos: number;
    stars: number;
    forks: number;
    commitsAnalyzed: number;
    oldestRepoDate: string | null;
    oldestRepo: string | null;
    newestRepo: string | null;
    newestRepoDate: string | null;
    reposProbed: number;
  };
  languagesByYear: {
    year: string;
    languages: { language: string; repoCount: number }[];
  }[];
  repos: {
    name: string;
    created: string;
    lang: string | null;
    desc: string | null;
    stars: number;
    forks?: number;
    commits: number;
    probed: boolean;
    archived?: boolean;
  }[];
  milestones: { repo: string; date: string; msg: string; sha: string }[];
  latestMilestones: { repo: string; date: string; msg: string; sha: string }[];
  commitSamples: BrainCommitSample[];
  fetchedAt: string;
  probeLimit: number;
};

function commitSamplesFromData(
  data: DevStoryData,
): BrainCommitSample[] {
  return Object.entries(data.repoCommits).map(([repo, rc]) => ({
    repo,
    totalCommits: rc.totalCommits,
    first: rc.firstCommit
      ? {
          sha: rc.firstCommit.sha,
          date: rc.firstCommit.date.slice(0, 10),
          msg: rc.firstCommit.message,
        }
      : null,
    recent: rc.recentCommits.map((c) => ({
      sha: c.sha,
      date: c.date.slice(0, 10),
      msg: c.message,
    })),
  }));
}

function reposForSnapshot(data: DevStoryData) {
  const probed = new Set(Object.keys(data.repoCommits));
  return [...data.repos]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX_SNAPSHOT_REPOS)
    .map((r) => ({
      name: r.name,
      created: r.createdAt.slice(0, 10),
      lang: r.language,
      desc: r.description,
      stars: r.stars,
      forks: r.forks,
      commits: data.repoCommits[r.name]?.totalCommits ?? 0,
      probed: probed.has(r.name),
      archived: r.archived,
    }));
}

export function summarizeStoryData(
  data: DevStoryData,
  probeLimit = BRAIN_COMMIT_PROBE,
): StoryDataSnapshot {
  const reposProbed = Object.keys(data.repoCommits).length;
  return {
    username: data.username,
    name: data.name,
    avatarUrl: data.avatarUrl,
    memberSince: data.profile.createdAt,
    profile: {
      bio: data.profile.bio,
      location: data.profile.location,
      company: data.profile.company,
      blog: data.profile.blog,
      followers: data.profile.followers,
      following: data.profile.following,
    },
    totals: {
      repos: data.totals.repoCount,
      stars: data.totals.totalStars,
      forks: data.totals.totalForks,
      commitsAnalyzed: data.totals.commitsAnalyzed,
      oldestRepoDate: data.totals.oldestRepoDate,
      oldestRepo: data.totals.oldestRepo,
      newestRepo: data.totals.newestRepo,
      newestRepoDate: data.totals.newestRepoDate,
      reposProbed,
    },
    languagesByYear: data.languagesByYear,
    repos: reposForSnapshot(data),
    milestones: data.milestones.map((m) => ({
      repo: m.repo,
      date: m.date.slice(0, 10),
      msg: m.message,
      sha: m.sha,
    })),
    latestMilestones: data.latestMilestones.map((m) => ({
      repo: m.repo,
      date: m.date.slice(0, 10),
      msg: m.message,
      sha: m.sha,
    })),
    commitSamples: commitSamplesFromData(data),
    fetchedAt: new Date().toISOString(),
    probeLimit,
  };
}

function deriveCommitSamplesFromMilestones(
  snapshot: StoryDataSnapshot,
): BrainCommitSample[] {
  const byRepo = new Map<string, BrainCommitSample>();
  const ingest = (
    m: StoryDataSnapshot["milestones"][number],
    kind: "first" | "recent",
  ) => {
    const existing = byRepo.get(m.repo) ?? {
      repo: m.repo,
      totalCommits: 0,
      first: null,
      recent: [],
    };
    const entry = { sha: m.sha, date: m.date, msg: m.msg };
    if (kind === "first" && !existing.first) {
      existing.first = entry;
    } else if (
      !existing.recent.some((c) => c.sha === entry.sha && c.date === entry.date)
    ) {
      existing.recent.push(entry);
    }
    byRepo.set(m.repo, existing);
  };

  for (const m of snapshot.milestones) ingest(m, "first");
  for (const m of snapshot.latestMilestones ?? []) ingest(m, "recent");

  return [...byRepo.values()];
}

/** Backfill fields for snapshots saved before the rich-brain schema. */
export function normalizeBrainSnapshot(
  snapshot: StoryDataSnapshot,
): StoryDataSnapshot {
  const repos = (snapshot.repos ?? []).map((r) => ({
    ...r,
    probed: r.probed ?? false,
    forks: r.forks ?? 0,
    archived: r.archived ?? false,
    commits: r.commits ?? 0,
  }));

  const commitSamples =
    snapshot.commitSamples?.length > 0
      ? snapshot.commitSamples
      : deriveCommitSamplesFromMilestones({
          ...snapshot,
          repos,
          latestMilestones: snapshot.latestMilestones ?? [],
        });

  const reposProbed =
    snapshot.totals.reposProbed ??
    (repos.filter((r) => r.probed).length || commitSamples.length);

  return {
    ...snapshot,
    avatarUrl: snapshot.avatarUrl ?? null,
    profile: snapshot.profile ?? {
      bio: null,
      location: null,
      company: null,
      blog: null,
      followers: 0,
      following: 0,
    },
    totals: {
      repos: snapshot.totals.repos,
      stars: snapshot.totals.stars,
      forks: snapshot.totals.forks ?? 0,
      commitsAnalyzed: snapshot.totals.commitsAnalyzed,
      oldestRepoDate: snapshot.totals.oldestRepoDate,
      oldestRepo: snapshot.totals.oldestRepo ?? null,
      newestRepo: snapshot.totals.newestRepo ?? null,
      newestRepoDate: snapshot.totals.newestRepoDate ?? null,
      reposProbed,
    },
    repos,
    latestMilestones: snapshot.latestMilestones ?? [],
    commitSamples,
    fetchedAt: snapshot.fetchedAt ?? new Date(0).toISOString(),
    probeLimit: snapshot.probeLimit ?? BRAIN_COMMIT_PROBE,
  };
}

export function snapshotToDevStoryData(
  snapshotInput: StoryDataSnapshot,
): DevStoryData {
  const snapshot = normalizeBrainSnapshot(snapshotInput);
  const repos: RepoSnapshot[] = snapshot.repos.map((r) => ({
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

  const repoCommits: Record<string, RepoCommitData> = {};
  for (const sample of snapshot.commitSamples) {
    repoCommits[sample.repo] = {
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

  const languageCounts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    languageCounts.set(
      repo.language,
      (languageCounts.get(repo.language) ?? 0) + 1,
    );
  }

  return {
    username: snapshot.username,
    name: snapshot.name,
    avatarUrl: snapshot.avatarUrl ?? "",
    profile: {
      bio: snapshot.profile.bio,
      location: snapshot.profile.location,
      company: snapshot.profile.company,
      blog: snapshot.profile.blog,
      createdAt: snapshot.memberSince ?? "",
      publicRepos: snapshot.totals.repos,
      followers: snapshot.profile.followers,
      following: snapshot.profile.following,
    },
    totals: {
      repoCount: snapshot.totals.repos,
      totalStars: snapshot.totals.stars,
      totalForks: snapshot.totals.forks,
      commitsAnalyzed: snapshot.totals.commitsAnalyzed,
      oldestRepo: snapshot.totals.oldestRepo,
      oldestRepoDate: snapshot.totals.oldestRepoDate,
      newestRepo: snapshot.totals.newestRepo,
      newestRepoDate: snapshot.totals.newestRepoDate,
    },
    languages: [...languageCounts.entries()]
      .map(([language, repoCount]) => ({ language, repoCount }))
      .sort((a, b) => b.repoCount - a.repoCount),
    languagesByYear: snapshot.languagesByYear,
    repos,
    milestones: snapshot.milestones.map((m) => ({
      repo: m.repo,
      sha: m.sha,
      date: m.date,
      message: m.msg,
    })),
    latestMilestones: (snapshot.latestMilestones ?? []).map((m) => ({
      repo: m.repo,
      sha: m.sha,
      date: m.date,
      message: m.msg,
    })),
    repoCommits,
  };
}

export function snapshotToPreview(data: StoryDataSnapshot): StoryPreviewData {
  const snapshot = normalizeBrainSnapshot(data);
  const toMilestone = (m: StoryDataSnapshot["milestones"][number]) => ({
    repo: m.repo,
    date: m.date,
    message: m.msg,
    sha: m.sha,
  });

  return {
    username: snapshot.username,
    totals: {
      repoCount: snapshot.totals.repos,
      totalStars: snapshot.totals.stars,
      commitsAnalyzed: snapshot.totals.commitsAnalyzed,
      oldestRepoDate: snapshot.totals.oldestRepoDate,
    },
    languagesByYear: snapshot.languagesByYear,
    milestones: snapshot.milestones.map(toMilestone),
    latestMilestones: snapshot.latestMilestones.map(toMilestone),
  };
}

export function minifyDevStory(
  data: DevStoryData,
  fingerprint = buildNarrativeFingerprint(data),
): string {
  const chronologicalRepos = [...data.repos].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const catalog = chronologicalRepos.slice(0, MAX_MINIFY_REPOS).map((r) => ({
    name: r.name,
    created: r.createdAt.slice(0, 10),
    lang: r.language,
    stars: r.stars,
    desc: r.description,
    commits: data.repoCommits[r.name]?.totalCommits ?? null,
    probed: Boolean(data.repoCommits[r.name]),
  }));

  const commitSamples = Object.entries(data.repoCommits).map(
    ([repoName, rc]) => ({
      repo: repoName,
      totalCommits: rc.totalCommits,
      first: rc.firstCommit
        ? {
            sha: rc.firstCommit.sha,
            date: rc.firstCommit.date.slice(0, 10),
            msg: rc.firstCommit.message,
          }
        : null,
      recent: rc.recentCommits.map((c) => ({
        sha: c.sha,
        date: c.date.slice(0, 10),
        msg: c.message,
      })),
    }),
  );

  return JSON.stringify({
    user: {
      username: data.username,
      name: data.name,
      bio: data.profile.bio,
      location: data.profile.location,
      company: data.profile.company,
      blog: data.profile.blog,
      memberSince: data.profile.createdAt,
      followers: data.profile.followers,
      following: data.profile.following,
    },
    summary: {
      repos: data.totals.repoCount,
      stars: data.totals.totalStars,
      forks: data.totals.totalForks,
      commitsSampled: data.totals.commitsAnalyzed,
      reposCommitProbed: Object.keys(data.repoCommits).length,
      oldestRepo: data.totals.oldestRepo,
      oldestRepoDate: data.totals.oldestRepoDate,
      newestRepo: data.totals.newestRepo,
      newestRepoDate: data.totals.newestRepoDate,
    },
    languagesOverTime: data.languagesByYear,
    allReposChronological: catalog,
    reposOmitted:
      data.repos.length > MAX_MINIFY_REPOS
        ? data.repos.length - MAX_MINIFY_REPOS
        : 0,
    commitSamples,
    earliestMilestones: data.milestones.map((m) => ({
      repo: m.repo,
      date: m.date.slice(0, 10),
      msg: m.message,
      sha: m.sha,
    })),
    latestMilestones: data.latestMilestones.map((m) => ({
      repo: m.repo,
      date: m.date.slice(0, 10),
      msg: m.message,
      sha: m.sha,
    })),
    narrativeFingerprint: fingerprint,
  });
}

export function minifyBrainSnapshot(
  snapshotInput: StoryDataSnapshot,
  fingerprint?: ReturnType<typeof buildNarrativeFingerprint>,
): string {
  const data = snapshotToDevStoryData(snapshotInput);
  return minifyDevStory(
    data,
    fingerprint ?? buildNarrativeFingerprint(data),
  );
}
