"use client";

import { StoryContent } from "@/components/story/story-content";
import { StoryMoment } from "@/components/story/story-moment";
import { StorySharePanel } from "@/components/story/story-share-panel";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

export function StoryView({
  story,
  mode,
  username,
  displayName,
  data = null,
  storyId = null,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  username: string;
  displayName: string;
  data?: StoryDataSnapshot | null;
  storyId?: string | null;
}) {
  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");

  return (
    <div className="space-y-10">
      <StoryContent story={story} mode={mode} data={data} />
      <StoryMoment
        key={fingerprint}
        story={story}
        data={data}
        fingerprint={fingerprint}
        autoSummon
      />
      <StorySharePanel
        story={story}
        storyId={storyId}
        username={username}
        displayName={displayName}
      />
    </div>
  );
}
