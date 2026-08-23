"use client";

import { useEffect } from "react";
import { StoryContent } from "@/components/story/story-content";
import { StoryMoment } from "@/components/story/story-moment";
import { StorySharePanel } from "@/components/story/story-share-panel";
import { prefetchStoryMoment } from "@/lib/client/story-moment-client";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

export function StoryView({
  story,
  mode,
  username,
  displayName,
  brain = null,
  storyId = null,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  username: string;
  displayName: string;
  brain?: StoryDataSnapshot | null;
  storyId?: string | null;
}) {
  const { locale } = useLocale();
  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");

  useEffect(() => {
    prefetchStoryMoment(story, brain, locale);
  }, [story, brain, locale, fingerprint]);

  return (
    <div className="space-y-10">
      <StoryContent story={story} mode={mode} data={brain} />
      <StoryMoment
        key={fingerprint}
        story={story}
        data={brain}
        fingerprint={fingerprint}
        autoSummon
      />
      <StorySharePanel
        story={story}
        storyId={storyId}
        username={username}
        displayName={displayName}
        brain={brain}
      />
    </div>
  );
}
