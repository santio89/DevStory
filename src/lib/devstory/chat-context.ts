import type { StoryDataSnapshot } from "./minify";
import { normalizeBrainSnapshot } from "./minify";
import { buildDeveloperProfileContext } from "./profile";
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

function formatRepoCatalog(brain: StoryDataSnapshot): string {
  const lines: string[] = [];
  const slice = brain.repos.slice(0, MAX_REPO_CATALOG);
  for (const r of slice) {
    const mark = r.probed ? "◆" : "·";
    const desc = r.desc ? ` | ${r.desc}` : "";
    lines.push(
      `${mark} ${r.name} | ${r.lang ?? "?"} | ★${r.stars} | ${r.created}${desc}`,
    );
  }
  if (brain.totals.repos > MAX_REPO_CATALOG) {
    lines.push(
      `… and ${brain.totals.repos - MAX_REPO_CATALOG} more public repositories (ask by name)`,
    );
  }
  return lines.join("\n");
}

export function buildChatContext(
  story: DevStory,
  brain: StoryDataSnapshot | null,
  extras?: ChatExtras,
): string {
  const sections: string[] = [];
  const snapshot = brain ? normalizeBrainSnapshot(brain) : null;

  if (snapshot) {
    const profile = [
      buildDeveloperProfileContext(snapshot),
      `Followers: ${snapshot.profile.followers} · Following: ${snapshot.profile.following}`,
      `Public repos: ${snapshot.totals.repos} · Stars: ${snapshot.totals.stars} · Commits counted (probed repos): ${snapshot.totals.commitsAnalyzed}`,
      snapshot.totals.oldestRepo
        ? `Oldest repo: ${snapshot.totals.oldestRepo} (${snapshot.totals.oldestRepoDate?.slice(0, 10) ?? "?"})`
        : null,
      snapshot.totals.newestRepo
        ? `Newest repo: ${snapshot.totals.newestRepo} (${snapshot.totals.newestRepoDate?.slice(0, 10) ?? "?"})`
        : null,
      `Repos with commit detail probed: ${snapshot.totals.reposProbed} of ${snapshot.totals.repos} (◆ in catalog below)`,
    ]
      .filter(Boolean)
      .join("\n");
    sections.push(`WHO THEY ARE\n${profile}`);
  }

  sections.push(storySection(story));

  if (extras?.moment) {
    sections.push(
      `A MEMORY FROM THIS TIMELINE
Title: ${extras.moment.title}
${extras.moment.dateLabel ?? extras.moment.year ?? ""}
${extras.moment.text}`,
    );
  }

  if (snapshot?.repos.length) {
    sections.push(
      `ALL PUBLIC REPOSITORIES (${snapshot.totals.repos} total — ◆ = commit history probed)\n${formatRepoCatalog(snapshot)}`,
    );
  }

  const ledger: { repo: string; sha: string; date: string; message: string }[] =
    [];

  if (snapshot) {
    for (const m of snapshot.milestones) {
      ledger.push({
        repo: m.repo,
        sha: m.sha,
        date: m.date,
        message: m.msg,
      });
    }
    for (const m of snapshot.latestMilestones) {
      ledger.push({
        repo: m.repo,
        sha: m.sha,
        date: m.date,
        message: m.msg,
      });
    }
    for (const sample of snapshot.commitSamples) {
      if (sample.first) {
        ledger.push({
          repo: sample.repo,
          sha: sample.first.sha,
          date: sample.first.date,
          message: sample.first.msg,
        });
      }
      for (const c of sample.recent) {
        ledger.push({
          repo: sample.repo,
          sha: c.sha,
          date: c.date,
          message: c.msg,
        });
      }
    }
  }

  const ledgerLines = dedupeCommits(ledger);
  if (ledgerLines.length > 0) {
    sections.push(
      `COMMITS IN YOUR LEDGER (only cite commits listed here)\n${ledgerLines.join("\n")}`,
    );
  }

  if (snapshot?.languagesByYear.length) {
    const langLines = snapshot.languagesByYear.map(
      (y) =>
        `  ${y.year}: ${y.languages.map((l) => `${l.language} (${l.repoCount})`).join(", ")}`,
    );
    sections.push(`LANGUAGES OVER TIME\n${langLines.join("\n")}`);
  }

  return sections.join("\n\n");
}
