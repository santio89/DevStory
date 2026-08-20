import { StoryView } from "@/components/story/story-view";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

const story: DevStory = {
  title: "From Hello World to Architect",
  summary: "A journey through the years, from first repos to real systems.",
  eras: [
    {
      year: "2020",
      name: "The Spark",
      description: "First repo, first fear, first merge.",
      keyLanguages: ["JavaScript"],
      token: "spark",
    },
    {
      year: "2022",
      name: "The Grind",
      description: "Midnight deploys and refactors that hurt.",
      keyLanguages: ["TypeScript"],
      token: "peak",
    },
    {
      year: "2024",
      name: "The Craft",
      description: "Teaching others, shipping tools, caring about names.",
      keyLanguages: ["Python"],
      token: "bridge",
    },
  ],
  closing: "Every commit was a step forward.",
  archetype: null,
};

const data: StoryDataSnapshot = {
  username: "testuser",
  name: "Test User",
  memberSince: null,
  totals: { repos: 3, stars: 0, commitsAnalyzed: 30, oldestRepoDate: "2020-01-01" },
  languagesByYear: [],
  repos: [{ name: "devtool", created: "2021-11-12", lang: "JS", desc: null, stars: 0, commits: 5 }],
  milestones: [{ repo: "devtool", date: "2021-11-12", msg: "big refactor", sha: "a" }],
};

export default function DevTestPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <StoryView
        story={story}
        mode="mock"
        storyId={null}
        data={data}
        fingerprint="test|fingerprint"
      />
    </main>
  );
}