import type { DevStoryData } from "./aggregate";
import type { StoryDataSnapshot } from "./minify";
import type { DevStory } from "./story";

const MAX_REPO_CATALOG = 250;

export type ChatExtras = {
  moment?: { title: string; text: string; year?: string; dateLabel?: string };
};

function formatCommit(c: {
  repo: string;
  sha: string;
  date: string;
  message: string;
}): string {
  const date = c.date.slice(0, 10);
  return `· ${c.repo} · ${c.sha} · ${date} · "${c.message}"`;
}

function dedupeCommits(
  commits: { repo: string; sha: string; date: string; message: string }[],
): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const c of commits) {
    const key = `${c.repo}:${c.sha}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(formatCommit(c));
  }
  return lines;
}

function storySection(story: DevStory): string {
  const eras = story.eras
    .map(
      (e) =>
        `  · ${e.year} — ${e.name}: ${e.description}${
          e.keyLanguages.length ? ` [${e.keyLanguages.join(", ")}]` : ""
        }`,
    )
    .join("\n");

  return `THE STORY YOU WROTE FOR THEM
Title: ${story.title}
${story.archetype ? `Archetype: ${story.archetype}` : ""}
Summary: ${story.summary}
Eras:
${eras}
${story.closing ? `Closing: ${story.closing}` : ""}`;
}

function formatRepoCatalog(
  repos: DevStoryData["repos"],
  probed: Set<string>,
): string {
  const lines: string[] = [];
  const slice = repos.slice(0, MAX_REPO_CATALOG);
  for (const r of slice) {
    const mark = probed.has(r.name) ? "◆" : "·";
    const desc = r.description ? ` | ${r.description}` : "";
    lines.push(
      `${mark} ${r.name} | ${r.language ?? "?"} | ★${r.stars} | ${r.createdAt.slice(0, 10)}${desc}`,
    );
  }
  if (repos.length > MAX_REPO_CATALOG) {
    lines.push(
      `… and ${repos.length - MAX_REPO_CATALOG} more public repositories (ask by name)`,
    );
  }
  return lines.join("\n");
}

export function buildChatContext(
  story: DevStory,
  git: DevStoryData | null,
  fallback: StoryDataSnapshot | null,
  extras?: ChatExtras,
): string {
  const sections: string[] = [];
  const probed = new Set(git ? Object.keys(git.repoCommits) : []);

  if (git) {
    const profile = [
      `Name: ${git.name} (@${git.username})`,
      git.profile.bio ? `Bio: ${git.profile.bio}` : null,
      git.profile.location ? `Location: ${git.profile.location}` : null,
      git.profile.company ? `Company: ${git.profile.company}` : null,
      git.profile.blog ? `Website: ${git.profile.blog}` : null,
      `On GitHub since: ${git.profile.createdAt?.slice(0, 10) ?? "unknown"}`,
      `Followers: ${git.profile.followers} · Following: ${git.profile.following}`,
      `Public repos: ${git.totals.repoCount} · Stars: ${git.totals.totalStars} · Commits counted (probed repos): ${git.totals.commitsAnalyzed}`,
      git.totals.oldestRepo
        ? `Oldest repo: ${git.totals.oldestRepo} (${git.totals.oldestRepoDate?.slice(0, 10) ?? "?"})`
        : null,
      git.totals.newestRepo
        ? `Newest repo: ${git.totals.newestRepo} (${git.totals.newestRepoDate?.slice(0, 10) ?? "?"})`
        : null,
      `Repos with commit detail probed: ${probed.size} of ${git.totals.repoCount} (◆ in catalog below)`,
    ]
      .filter(Boolean)
      .join("\n");
    sections.push(`WHO THEY ARE\n${profile}`);
  } else if (fallback) {
    sections.push(
      `WHO THEY ARE
Name: ${fallback.name} (@${fallback.username})
On GitHub since: ${fallback.memberSince?.slice(0, 10) ?? "unknown"}
Public repos: ${fallback.totals.repos} · Stars: ${fallback.totals.stars}`,
    );
  }

  sections.push(storySection(story));

  if (extras?.moment) {
    sections.push(
      `A MEMORY THEY SUMMONED EARLIER
Title: ${extras.moment.title}
${extras.moment.dateLabel ?? extras.moment.year ?? ""}
${extras.moment.text}`,
    );
  }

  if (git && git.repos.length > 0) {
    sections.push(
      `ALL PUBLIC REPOSITORIES (${git.repos.length} total — ◆ = commit history probed)\n${formatRepoCatalog(git.repos, probed)}`,
    );
  } else if (fallback?.repos.length) {
    sections.push(
      `REPOSITORIES (partial snapshot)\n${fallback.repos
        .map(
          (r) =>
            `· ${r.name} | ${r.lang ?? "?"} | ★${r.stars} | ${r.created}${r.desc ? ` | ${r.desc}` : ""}`,
        )
        .join("\n")}`,
    );
  }

  const ledger: { repo: string; sha: string; date: string; message: string }[] =
    [];
  if (git) {
    for (const m of git.milestones) {
      ledger.push({
        repo: m.repo,
        sha: m.sha,
        date: m.date,
        message: m.message,
      });
    }
    for (const rc of Object.values(git.repoCommits)) {
      if (rc.firstCommit) {
        ledger.push({
          repo: rc.firstCommit.repo,
          sha: rc.firstCommit.sha,
          date: rc.firstCommit.date,
          message: rc.firstCommit.message,
        });
      }
      for (const c of rc.recentCommits) {
        ledger.push({
          repo: c.repo,
          sha: c.sha,
          date: c.date,
          message: c.message,
        });
      }
    }
  } else if (fallback?.milestones.length) {
    for (const m of fallback.milestones) {
      ledger.push({
        repo: m.repo,
        sha: m.sha,
        date: m.date,
        message: m.msg,
      });
    }
  }

  const ledgerLines = dedupeCommits(ledger);
  if (ledgerLines.length > 0) {
    sections.push(
      `COMMITS IN YOUR LEDGER (only cite commits listed here)\n${ledgerLines.join("\n")}`,
    );
  }

  if (git?.languagesByYear.length) {
    const langLines = git.languagesByYear.map(
      (y) =>
        `  ${y.year}: ${y.languages.map((l) => `${l.language} (${l.repoCount})`).join(", ")}`,
    );
    sections.push(`LANGUAGES OVER TIME\n${langLines.join("\n")}`);
  } else if (fallback?.languagesByYear.length) {
    const langLines = fallback.languagesByYear.map(
      (y) =>
        `  ${y.year}: ${y.languages.map((l) => `${l.language} (${l.repoCount})`).join(", ")}`,
    );
    sections.push(`LANGUAGES OVER TIME\n${langLines.join("\n")}`);
  }

  return sections.join("\n\n");
}
