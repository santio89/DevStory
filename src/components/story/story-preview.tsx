"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { langColor } from "@/components/story/languages";
import type { StoryPreviewData } from "@/lib/devstory/aggregate";
import { GitCommit, RefreshCw, Star, FolderGit2 } from "lucide-react";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StoryPreview({
  initialData,
  initialError = null,
}: {
  initialData: StoryPreviewData | null;
  initialError?: string | null;
}) {
  const [data, setData] = useState<StoryPreviewData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/story?refresh=1", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "You need to be signed in to fetch your story data."
            : `GitHub data fetch failed (${res.status}).`,
        );
      }
      const json = (await res.json()) as { preview: StoryPreviewData };
      setData(json.preview);
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
            phase 02 · the brain
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            Raw GitHub data
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Digging…" : "Re-fetch"}
        </button>
      </div>

      {loading && (
        <Card className="bg-zinc-900/40">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm text-muted-foreground">
            <GitCommit className="size-4 animate-pulse text-amber-400" />
            harvesting commit history…
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="py-4 font-mono text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              {
                label: "repos",
                value: data.totals.repoCount,
                icon: FolderGit2,
                color: "text-blue-400",
              },
              {
                label: "stars",
                value: data.totals.totalStars,
                icon: Star,
                color: "text-amber-400",
              },
              {
                label: "commits analyzed",
                value: data.totals.commitsAnalyzed,
                icon: GitCommit,
                color: "text-emerald-400",
              },
              {
                label: "first repo",
                value: formatDate(data.totals.oldestRepoDate),
                icon: GitCommit,
                color: "text-violet-400",
              },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.05 * i}>
                <Card className="h-full bg-zinc-900/40 ring-1 ring-border/50">
                  <CardContent className="flex flex-col gap-3 py-5">
                    <stat.icon className={`size-4 ${stat.color}`} />
                    <div>
                      <div className="font-mono text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FadeIn>
              <Card className="h-full bg-zinc-900/40 ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle>Languages over time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.languagesByYear.length === 0 && (
                    <p className="font-mono text-sm text-muted-foreground">
                      no language data yet
                    </p>
                  )}
                  {data.languagesByYear.map((year) => (
                    <div key={year.year}>
                      <div className="mb-2 font-mono text-xs text-muted-foreground">
                        {year.year}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {year.languages.map((lang) => (
                          <span
                            key={lang.language}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-zinc-800/60 px-2.5 py-1 font-mono text-xs"
                          >
                            <span
                              className="inline-block size-1.5 rounded-full"
                              style={{
                                backgroundColor: langColor(lang.language),
                                boxShadow: `0 0 8px 1px ${langColor(lang.language)}66`,
                              }}
                            />
                            {lang.language} ×{lang.repoCount}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="h-full bg-zinc-900/40 ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle>Earliest commits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.milestones.length === 0 && (
                    <p className="font-mono text-sm text-muted-foreground">
                      no commits found in your oldest repos
                    </p>
                  )}
                  {data.milestones.map((m) => (
                    <div
                      key={`${m.repo}-${m.sha}`}
                      className="border-l-2 border-amber-400/50 pl-3"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-amber-400">{m.sha}</span>
                        <span className="text-muted-foreground">
                          {formatDate(m.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{m.message}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {m.repo}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}