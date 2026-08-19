import type { Octokit } from "octokit";

export type CommitMilestone = {
  repo: string;
  sha: string;
  date: string;
  message: string;
};

export type RepoCommitData = {
  firstCommit: CommitMilestone | null;
  recentCommits: CommitMilestone[];
  totalCommits: number;
};

type CommitItem = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listCommits"]>
>["data"][number];

const RECENT_COMMITS_LIMIT = 5;
const MAX_MESSAGE_LENGTH = 80;

function parseLastPage(linkHeader: string | undefined): number | undefined {
  if (!linkHeader) return undefined;
  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : undefined;
}

function toMilestone(repo: string, commit: CommitItem): CommitMilestone | null {
  const sha = commit.sha;
  const message = commit.commit?.message?.split("\n")[0];
  const date =
    commit.commit?.committer?.date ?? commit.commit?.author?.date;
  if (!sha || !message || !date) return null;

  return {
    repo,
    sha: sha.slice(0, 7),
    date,
    message:
      message.length > MAX_MESSAGE_LENGTH
        ? `${message.slice(0, MAX_MESSAGE_LENGTH - 1)}…`
        : message,
  };
}

export async function fetchRepoCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string,
): Promise<RepoCommitData> {
  const page = await octokit.rest.repos.listCommits({
    owner,
    repo,
    sha: defaultBranch,
    per_page: 100,
  });

  const latest = page.data;
  const lastPage = parseLastPage(page.headers.link);

  let oldestPageData: CommitItem[] | null = null;
  if (lastPage && lastPage > 1) {
    const oldestPage = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: defaultBranch,
      per_page: 100,
      page: lastPage,
    });
    oldestPageData = oldestPage.data;
  }

  const totalCommits =
    oldestPageData !== null
      ? (lastPage! - 1) * 100 + oldestPageData.length
      : latest.length;

  const firstCommit: CommitItem | null =
    oldestPageData !== null
      ? oldestPageData[oldestPageData.length - 1] ?? null
      : latest[latest.length - 1] ?? null;

  return {
    firstCommit: firstCommit ? toMilestone(repo, firstCommit) : null,
    recentCommits: latest
      .slice(0, RECENT_COMMITS_LIMIT)
      .map((commit) => toMilestone(repo, commit))
      .filter((c): c is CommitMilestone => c !== null),
    totalCommits,
  };
}
