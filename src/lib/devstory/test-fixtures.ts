import type { DevStoryData } from "@/lib/devstory/aggregate";

/** Realistic GitHub-shaped fixture covering a multi-year arc. */
export function buildFixtureData(
  overrides: Partial<DevStoryData> = {},
): DevStoryData {
  const base: DevStoryData = {
    username: "octonaught",
    name: "Octavia Naught",
    avatarUrl: "https://avatars.githubusercontent.com/u/1",
    profile: {
      bio: "ships small tools, breaks big things",
      location: "Berlin",
      company: null,
      blog: null,
      createdAt: "2018-03-12T10:00:00Z",
      publicRepos: 6,
      followers: 42,
      following: 17,
    },
    totals: {
      repoCount: 6,
      totalStars: 9,
      totalForks: 3,
      commitsAnalyzed: 90,
      oldestRepo: "hello-world",
      oldestRepoDate: "2019-01-05",
      newestRepo: "tide",
      newestRepoDate: "2024-11-02",
    },
    languages: [
      { language: "TypeScript", repoCount: 3 },
      { language: "Python", repoCount: 2 },
      { language: "Rust", repoCount: 1 },
    ],
    languagesByYear: [
      {
        year: "2019",
        languages: [{ language: "JavaScript", repoCount: 1 }],
      },
      {
        year: "2021",
        languages: [{ language: "Python", repoCount: 1 }],
      },
      {
        year: "2023",
        languages: [{ language: "TypeScript", repoCount: 2 }],
      },
      {
        year: "2024",
        languages: [{ language: "TypeScript", repoCount: 1 }],
      },
    ],
    repos: [
      {
        name: "hello-world",
        description: null,
        createdAt: "2019-01-05T00:00:00Z",
        defaultBranch: "main",
        language: "JavaScript",
        size: 1,
        stars: 0,
        forks: 0,
        archived: false,
        fork: false,
      },
      {
        name: "octo-cli",
        description: "octopus-ish command line",
        createdAt: "2021-06-20T00:00:00Z",
        defaultBranch: "main",
        language: "Python",
        size: 42,
        stars: 2,
        forks: 1,
        archived: false,
        fork: false,
      },
      {
        name: "tide",
        description: null,
        createdAt: "2023-09-14T00:00:00Z",
        defaultBranch: "main",
        language: "TypeScript",
        size: 120,
        stars: 7,
        forks: 2,
        archived: false,
        fork: false,
      },
      {
        name: "ember-tools",
        description: null,
        createdAt: "2024-11-02T00:00:00Z",
        defaultBranch: "main",
        language: "TypeScript",
        size: 60,
        stars: 0,
        forks: 0,
        archived: false,
        fork: false,
      },
      {
        name: "rust-geodesy",
        description: null,
        createdAt: "2022-02-11T00:00:00Z",
        defaultBranch: "main",
        language: "Rust",
        size: 220,
        stars: 0,
        forks: 0,
        archived: true,
        fork: false,
      },
    ],
    milestones: [
      { repo: "hello-world", sha: "a1", date: "2019-01-06T01:23:00Z", message: "first commit, obviously" },
      { repo: "octo-cli", sha: "b2", date: "2021-06-21T09:00:00Z", message: "ship v0.1" },
      { repo: "tide", sha: "c3", date: "2023-09-15T00:00:00Z", message: "rewrite the scheduler" },
    ],
    latestMilestones: [
      { repo: "tide", sha: "d4", date: "2024-10-30T00:00:00Z", message: "drop the legacy parser" },
      { repo: "ember-tools", sha: "e5", date: "2024-11-02T00:00:00Z", message: "first release" },
    ],
    repoCommits: {
      "hello-world": {
        totalCommits: 1,
        firstCommit: {
          repo: "hello-world",
          sha: "a1",
          date: "2019-01-06T01:23:00Z",
          message: "first commit, obviously",
        },
        recentCommits: [
          { repo: "hello-world", sha: "a1", date: "2019-01-06T01:23:00Z", message: "first commit, obviously" },
        ],
      },
      "octo-cli": {
        totalCommits: 30,
        firstCommit: {
          repo: "octo-cli",
          sha: "b2",
          date: "2021-06-21T09:00:00Z",
          message: "ship v0.1",
        },
        recentCommits: [
          { repo: "octo-cli", sha: "b2", date: "2021-06-21T09:00:00Z", message: "ship v0.1" },
          { repo: "octo-cli", sha: "b3", date: "2021-06-22T09:00:00Z", message: "fix the tentacle" },
        ],
      },
      tide: {
        totalCommits: 58,
        firstCommit: {
          repo: "tide",
          sha: "c3",
          date: "2023-09-15T00:00:00Z",
          message: "rewrite the scheduler",
        },
        recentCommits: [
          { repo: "tide", sha: "d4", date: "2024-10-30T00:00:00Z", message: "drop the legacy parser" },
        ],
      },
    },
  };

  return { ...base, ...overrides };
}