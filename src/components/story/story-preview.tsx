"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { langColor } from "@/components/story/languages";
import { useLocale } from "@/components/locale/locale-provider";
import type { StoryPreviewData } from "@/lib/devstory/aggregate";
import type { Locale } from "@/lib/i18n/dictionary";
import { RepoBookIcon } from "@/components/icons/repo-book";
import { GitCommit, RefreshCw, Star, FolderGit2, AlertTriangle } from "lucide-react";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommitList({
  commits,
  emptyLabel,
  locale,
}: {
  commits: StoryPreviewData["milestones"];
  emptyLabel: string;
  locale: Locale;
}) {
  if (commits.length === 0) {
    return (
      <p className="font-mono text-sm font-bold tracking-wider text-muted-foreground uppercase">
        {emptyLabel}
      </p>
    );
  }

  return (
    <>
      {commits.map((m) => (
        <div
          key={`${m.repo}-${m.sha}`}
          className="border-l-4 border-bauhaus-deep pl-3"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <span className="bg-bauhaus-sky/20 px-1.5 text-bauhaus-deep">
              {m.sha}
            </span>
            <span className="text-muted-foreground">
              {formatDate(m.date, locale)}
            </span>
          </div>
          <p className="mt-1 text-sm text-pretty">{m.message}</p>
          <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {m.repo}
          </p>
        </div>
      ))}
    </>
  );
}

export function StoryPreview({
  username,
  onLoadingChange,
  staticData = null,
}: {
  username: string;
  onLoadingChange?: (loading: boolean) => void;
  staticData?: StoryPreviewData | null;
}) {
  const { t, locale } = useLocale();
  const [data, setData] = useState<StoryPreviewData | null>(staticData);
  const [loading, setLoading] = useState(!staticData);
  const [error, setError] = useState<string | null>(null);

  const readOnly = Boolean(staticData);

  async function fetchPreview(refresh = false, signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = new URLSearchParams({ username });
      if (refresh) params.set("refresh", "1");
      const res = await fetch(`/api/story?${params}`, {
        cache: "no-store",
        signal,
      });
      const json = (await res.json()) as {
        preview?: StoryPreviewData;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? t.preview.fetchError(res.status));
      }
      setData(json.preview ?? null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : t.preview.genericError);
      setData(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (staticData) {
      setData(staticData);
      setLoading(false);
      setError(null);
      return;
    }

    const ac = new AbortController();
    let active = true;

    void (async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const params = new URLSearchParams({ username });
        const res = await fetch(`/api/story?${params}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const json = (await res.json()) as {
          preview?: StoryPreviewData;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error ?? t.preview.fetchError(res.status));
        }
        if (active) setData(json.preview ?? null);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (active) {
          setError(e instanceof Error ? e.message : t.preview.genericError);
          setData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [username, staticData, locale, t.preview.fetchError, t.preview.genericError]);

  useEffect(() => {
    if (readOnly) return;
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange, readOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.preview.phase}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-normal text-balance uppercase">
            {t.preview.titleFor(username)}
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void fetchPreview(true)}
          disabled={loading || readOnly}
          className={readOnly ? "invisible" : undefined}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? t.preview.digging : t.preview.refresh}
        </Button>
      </div>

      {loading && (
        <Card className="bg-card shadow-hard">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm font-bold tracking-wider text-muted-foreground uppercase">
            <GitCommit className="size-4 animate-pulse text-bauhaus-deep" />
            {t.preview.harvestingFor(username)}
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-destructive bg-destructive/10 shadow-none">
          <CardContent className="flex items-center gap-2 py-4 font-mono text-sm font-bold text-destructive uppercase">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-5 sm:grid-cols-4">
            {[
              {
                label: t.preview.repos,
                value: data.totals.repoCount,
                icon: FolderGit2,
                color: "text-bauhaus-deep",
                block: false,
              },
              {
                label: t.preview.stars,
                value: data.totals.totalStars,
                icon: Star,
                color: "text-bauhaus-ink",
                block: true,
              },
              {
                label: t.preview.commitsAnalyzed,
                value: data.totals.commitsAnalyzed,
                icon: GitCommit,
                color: "text-bauhaus-deep",
                block: false,
              },
              {
                label: t.preview.firstRepo,
                value: formatDate(data.totals.oldestRepoDate, locale),
                icon: RepoBookIcon,
                color: "text-bauhaus-deep",
                block: false,
              },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.05 * i}>
                <Card
                  className={`relative h-full shadow-hard transition-transform duration-200 hover:-translate-y-1 ${
                    stat.block
                      ? "border-foreground bg-bauhaus-yellow text-bauhaus-ink"
                      : "bg-card"
                  }`}
                >
                  <CardContent className="flex flex-col gap-3 py-5">
                    <stat.icon className={`size-4 ${stat.color}`} />
                    <div>
                      <div className="font-mono text-2xl font-bold tracking-tight">
                        {stat.value}
                      </div>
                      <div className="mt-0.5 text-xs font-bold tracking-wider uppercase opacity-80">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <FadeIn>
              <Card className="relative h-full bg-card shadow-hard">
                <CardHeader>
                  <CardTitle>{t.preview.languagesTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.languagesByYear.length === 0 && (
                    <p className="font-mono text-sm font-bold tracking-wider text-muted-foreground uppercase">
                      {t.preview.noLanguageData}
                    </p>
                  )}
                  {data.languagesByYear.map((year) => (
                    <div key={year.year}>
                      <div className="mb-2 bg-bauhaus-sky/20 px-1.5 py-0.5 font-mono text-xs font-bold tracking-[0.2em] text-bauhaus-deep uppercase">
                        {year.year}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {year.languages.map((lang) => (
                          <span
                            key={lang.language}
                            className="inline-flex items-center gap-1.5 rounded-none border-2 border-foreground bg-background px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider"
                          >
                            <span
                              className="inline-block size-2 rounded-none"
                              style={{ backgroundColor: langColor(lang.language) }}
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
              <Card className="relative h-full bg-card shadow-hard">
                <CardHeader className="space-y-4">
                  <CardTitle>{t.preview.earliestCommits}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CommitList
                    commits={data.milestones}
                    emptyLabel={t.preview.noCommits}
                    locale={locale}
                  />
                </CardContent>
                <CardHeader className="space-y-4 border-t-2 border-foreground pt-4">
                  <CardTitle>{t.preview.latestCommits}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CommitList
                    commits={data.latestMilestones}
                    emptyLabel={t.preview.noLatestCommits}
                    locale={locale}
                  />
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
