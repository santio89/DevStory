"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryView } from "@/components/story/story-view";
import type { DevStory } from "@/lib/devstory/story";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

export function StoryGenerator() {
  const [story, setStory] = useState<DevStory | null>(null);
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "You need to be signed in to generate a story."
            : "Story generation failed. Try again.",
        );
      }
      const json = (await res.json()) as {
        story: DevStory;
        mode: "ai" | "mock";
        storyId: string | null;
      };
      setStory(json.story);
      setMode(json.mode);
      setStoryId(json.storyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            phase 03 · the biographer
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            Your DevStory
          </h2>
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={loading}
          size="sm"
        >
          <Sparkles className="text-amber-400" />
          {loading ? "Writing…" : story ? "Rewrite my story" : "Generate my story"}
        </Button>
      </div>

      {loading && (
        <Card className="bg-zinc-900/40">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-amber-400" />
            the biographer is reading your commits…
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="flex items-center gap-2 py-4 font-mono text-sm text-destructive">
            <AlertTriangle className="size-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {story && !loading && (
        <FadeIn>
          <StoryView story={story} mode={mode ?? "mock"} storyId={storyId} />
        </FadeIn>
      )}
    </div>
  );
}