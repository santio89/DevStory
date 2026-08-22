import type { DevStoryData } from "./aggregate";
import type { StoryPreviewData } from "./aggregate";
import { buildNarrativeFingerprint } from "./narrative-context";

const MAX_SNAPSHOT_REPOS = 30;
const MAX_MINIFY_REPOS = 250;

export type StoryDataSnapshot = {
  username: string;
  name: string;
  memberSince: string | null;
  totals: {
    repos: number;
    stars: number;
    commitsAnalyzed: number;
    oldestRepoDate: string | null;
  };
  languagesByYear: { year: string; languages: { language: string; repoCount: number }[] }[];
  repos: {
    name: string;
    created: string;
    lang: string | null;
    desc: string | null;
    stars: number;
    commits: number;
  }[];
  milestones: { repo: string; date: string; msg: string; sha: string }[];
  latestMilestones: { repo: string; date: string; msg: string; sha: string }[];
};

function topReposForSnapshot(data: DevStoryData) {
  return [...data.repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, MAX_SNAPSHOT_REPOS)
    .map((r) => ({
      name: r.name,
      created: r.createdAt.slice(0, 10),
      lang: r.language,
      desc: r.description,
      stars: r.stars,
      commits: data.repoCommits[r.name]?.totalCommits ?? 0,
    }));
}

export function summarizeStoryData(data: DevStoryData): StoryDataSnapshot {
  return {
    username: data.username,
    name: data.name,
    memberSince: data.profile.createdAt,
    totals: {
      repos: data.totals.repoCount,
      stars: data.totals.totalStars,
      commitsAnalyzed: data.totals.commitsAnalyzed,
      oldestRepoDate: data.totals.oldestRepoDate,
    },
    languagesByYear: data.languagesByYear,
    repos: topReposForSnapshot(data),
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
  };
}

export function snapshotToPreview(data: StoryDataSnapshot): StoryPreviewData {
  const toMilestone = (m: StoryDataSnapshot["milestones"][number]) => ({
    repo: m.repo,
    date: m.date,
    message: m.msg,
    sha: m.sha,
  });

  return {
    username: data.username,
    totals: {
      repoCount: data.totals.repos,
      totalStars: data.totals.stars,
      commitsAnalyzed: data.totals.commitsAnalyzed,
      oldestRepoDate: data.totals.oldestRepoDate,
    },
    languagesByYear: data.languagesByYear,
    milestones: data.milestones.map(toMilestone),
    latestMilestones: (data.latestMilestones ?? []).map(toMilestone),
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
