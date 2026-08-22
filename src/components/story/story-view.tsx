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
  const { locale } = useLocale();
  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");

  useEffect(() => {
    prefetchStoryMoment(story, data, locale);
  }, [story, data, locale, fingerprint]);

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
