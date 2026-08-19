import { createGitHubClient } from "./client";

export type RepoSnapshot = {
  name: string;
  description: string | null;
  createdAt: string;
  defaultBranch: string;
  language: string | null;
  size: number;
  stars: number;
  forks: number;
  archived: boolean;
  fork: boolean;
};

const MAX_DESCRIPTION_LENGTH = 140;

function truncate(value: string | null, max: number): string | null {
  if (!value) return value;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export async function fetchRepos(accessToken: string): Promise<RepoSnapshot[]> {
  const octokit = createGitHubClient(accessToken);

  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      affiliation: "owner",
      sort: "created",
      direction: "asc",
    },
  );

  return repos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      name: repo.name,
      description: truncate(repo.description, MAX_DESCRIPTION_LENGTH),
      createdAt: repo.created_at ?? "",
      defaultBranch: repo.default_branch ?? "HEAD",
      language: repo.language,
      size: repo.size ?? 0,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      archived: repo.archived ?? false,
      fork: repo.fork ?? false,
    }));
}
