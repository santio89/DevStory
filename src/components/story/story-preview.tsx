"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { langColor } from "@/components/story/languages";
import { useLocale } from "@/components/locale/locale-provider";
import type { StoryPreviewData } from "@/lib/devstory/aggregate";
import type { Locale } from "@/lib/i18n/dictionary";
import { GitCommit, RefreshCw, Star, FolderGit2 } from "lucide-react";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
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
  const { t, locale } = useLocale();
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
            ? t.preview.signInError
            : t.preview.fetchError(res.status),
        );
      }
      const json = (await res.json()) as { preview: StoryPreviewData };
      setData(json.preview);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.preview.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {t.preview.phase}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            {t.preview.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? t.preview.digging : t.preview.refresh}
        </button>
      </div>

      {loading && (
        <Card className="bg-muted/40">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm text-muted-foreground">
            <GitCommit className="size-4 animate-pulse text-cyan-400" />
            {t.preview.harvesting}
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
                label: t.preview.repos,
                value: data.totals.repoCount,
                icon: FolderGit2,
                color: "text-sky-400",
              },
              {
                label: t.preview.stars,
                value: data.totals.totalStars,
                icon: Star,
                color: "text-pink-400",
              },
              {
                label: t.preview.commitsAnalyzed,
                value: data.totals.commitsAnalyzed,
                icon: GitCommit,
                color: "text-cyan-400",
              },
              {
                label: t.preview.firstRepo,
                value: formatDate(data.totals.oldestRepoDate, locale),
                icon: GitCommit,
                color: "text-violet-400",
              },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.05 * i}>
                <Card className="h-full bg-muted/40 ring-1 ring-border/50">
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
              <Card className="h-full bg-muted/40 ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle>{t.preview.languagesTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.languagesByYear.length === 0 && (
                    <p className="font-mono text-sm text-muted-foreground">
                      {t.preview.noLanguageData}
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
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 font-mono text-xs"
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
              <Card className="h-full bg-muted/40 ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle>{t.preview.earliestCommits}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.milestones.length === 0 && (
                    <p className="font-mono text-sm text-muted-foreground">
                      {t.preview.noCommits}
                    </p>
                  )}
                  {data.milestones.map((m) => (
                    <div
                      key={`${m.repo}-${m.sha}`}
                      className="border-l-2 border-cyan-400/50 pl-3"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-cyan-400">{m.sha}</span>
                        <span className="text-muted-foreground">
                          {formatDate(m.date, locale)}
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