import type { DevStoryData } from "./aggregate";

const MAX_HIGHLIGHTED_REPOS = 15;

export function minifyDevStory(data: DevStoryData): string {
  return JSON.stringify({
    user: {
      username: data.username,
      name: data.name,
      bio: data.profile.bio,
      location: data.profile.location,
      memberSince: data.profile.createdAt,
      followers: data.profile.followers,
    },
    summary: {
      repos: data.totals.repoCount,
      stars: data.totals.totalStars,
      oldestRepo: data.totals.oldestRepo,
      oldestRepoDate: data.totals.oldestRepoDate,
      newestRepo: data.totals.newestRepo,
      newestRepoDate: data.totals.newestRepoDate,
    },
    languagesOverTime: data.languagesByYear,
    repoHighlights: data.repos.slice(0, MAX_HIGHLIGHTED_REPOS).map((r) => ({
      name: r.name,
      created: r.createdAt.slice(0, 10),
      lang: r.language,
      desc: r.description,
      stars: r.stars,
    })),
    commitMilestones: data.milestones.map((m) => ({
      repo: m.repo,
      date: m.date.slice(0, 10),
      msg: m.message,
      sha: m.sha,
    })),
  });
}
