import { Octokit } from "octokit";

export function createGitHubClient(): Octokit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return new Octokit(token ? { auth: token } : {});
}
