"use client";

import { FadeIn, Reveal } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { langColor } from "@/components/story/languages";
import { DeveloperPortrait } from "@/components/story/developer-portrait";
import { ProfileCaption } from "@/components/story/profile-caption";
import { SectionTitle } from "@/components/story/section-title";
import { useBrain } from "@/components/story/brain-provider";
import { BrainPreviewSkeleton } from "@/components/story/story-loading-skeletons";
import { useLocale } from "@/components/locale/locale-provider";
import type { StoryPreviewData } from "@/lib/devstory/aggregate";
import type { Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import { RepoBookIcon } from "@/components/icons/repo-book";
import {
  GitCommit,
  RefreshCw,
  Star,
  FolderGit2,
  AlertTriangle,
} from "lucide-react";

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "-";
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

function previewFromBrain(
  brain: NonNullable<ReturnType<typeof useBrain>["brain"]>,
): StoryPreviewData {
  return {
    username: brain.username,
    totals: {
      repoCount: brain.totals.repos,
      totalStars: brain.totals.stars,
      commitsAnalyzed: brain.totals.commitsAnalyzed,
      oldestRepoDate: brain.totals.oldestRepoDate,
    },
    languagesByYear: brain.languagesByYear,
    milestones: brain.milestones.map((m) => ({
      repo: m.repo,
      date: m.date,
      message: m.msg,
      sha: m.sha,
    })),
    latestMilestones: brain.latestMilestones.map((m) => ({
      repo: m.repo,
      date: m.date,
      message: m.msg,
      sha: m.sha,
    })),
  };
}

function BrainIdentityMeta({
  brain,
  totals,
  locale,
}: {
  brain: NonNullable<ReturnType<typeof useBrain>["brain"]>;
  totals: StoryPreviewData["totals"];
  locale: Locale;
}) {
  const { t } = useLocale();
  const meta = [brain.profile.location, brain.profile.company]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  const stats = [
    {
      label: t.preview.repos,
      value: totals.repoCount,
      icon: FolderGit2,
      color: "text-bauhaus-deep",
      highlight: false,
      compact: false,
    },
    {
      label: t.preview.stars,
      value: totals.totalStars,
      icon: Star,
      color: "text-bauhaus-ink",
      highlight: true,
      compact: false,
    },
    {
      label: t.preview.commitsAnalyzed,
      value: totals.commitsAnalyzed,
      icon: GitCommit,
      color: "text-bauhaus-deep",
      highlight: false,
      compact: false,
    },
    {
      label: t.preview.firstRepo,
      value: formatDate(totals.oldestRepoDate, locale),
      icon: RepoBookIcon,
      color: "text-bauhaus-deep",
      highlight: false,
      compact: true,
    },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-none border-2 border-foreground bg-card p-4 shadow-hard sm:p-5">
      <span
        className="pointer-events-none absolute top-3 right-3 size-2.5 rotate-45 bg-bauhaus-cyan"
        aria-hidden
      />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <DeveloperPortrait data={brain} size="brain" className="shrink-0" />
          <div className="min-w-0 flex-1 self-start">
            <ProfileCaption data={brain} className="text-center sm:text-left" />
            {meta.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                {meta.map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-none border-2 border-foreground bg-bauhaus-sky/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.18em] text-bauhaus-deep uppercase shadow-hard-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 border-t-2 border-foreground pt-4 sm:gap-3 lg:w-[min(100%,34rem)] lg:shrink-0 lg:grid-cols-4 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-5 xl:w-[36rem]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex min-h-[5.5rem] flex-col justify-between gap-2 rounded-none border-2 border-foreground p-3 shadow-hard-sm transition-transform duration-200 hover:-translate-y-0.5",
                stat.highlight
                  ? "bg-bauhaus-yellow text-bauhaus-ink"
                  : "bg-background",
              )}
            >
              <stat.icon className={cn("size-4 shrink-0", stat.color)} />
              <div>
                <div
                  className={cn(
                    "font-mono font-bold tracking-tight",
                    stat.compact
                      ? "text-sm leading-tight sm:text-base"
                      : "text-xl sm:text-2xl",
                  )}
                >
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[10px] font-bold tracking-[0.16em] uppercase opacity-80 sm:text-xs">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StoryPreview({ username }: { username: string }) {
  const { t, locale } = useLocale();
  const { brain, brainLoading, brainError, refreshBrain } = useBrain();
  const fetching = brainLoading;
  const displayData = fetching ? null : brain ? previewFromBrain(brain) : null;
  const loading = brainLoading || (!brain && !brainError);
  const showRefreshButton = Boolean(brain) || Boolean(brainError);

  return (
    <div className="space-y-6">
      <Reveal variant="subtle">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle
          section={t.preview.section}
          title={displayData ? t.preview.title : t.preview.titleFor(username)}
          mark="brain"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refreshBrain(true)}
          disabled={fetching}
          className={showRefreshButton ? undefined : "invisible"}
        >
          <RefreshCw className={fetching ? "animate-spin" : ""} />
          {fetching ? t.preview.digging : t.preview.refresh}
        </Button>
      </div>
      </Reveal>

      {loading && (
        <Reveal variant="enter" key="loading">
          <BrainPreviewSkeleton statusLabel={t.preview.harvestingFor(username)} />
        </Reveal>
      )}

      {brainError && !fetching && (
        <Card className="border-destructive bg-destructive/10 shadow-none">
          <CardContent className="flex items-center gap-2 py-4 font-mono text-sm font-bold text-destructive uppercase">
            <AlertTriangle className="size-4 shrink-0" />
            {brainError}
          </CardContent>
        </Card>
      )}

      {displayData && brain && (
        <FadeIn>
          <BrainIdentityMeta
            brain={brain}
            totals={displayData.totals}
            locale={locale}
          />
        </FadeIn>
      )}

      {displayData && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <FadeIn>
              <Card className="relative h-full bg-card shadow-hard">
                <CardHeader>
                  <CardTitle>{t.preview.languagesTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayData.languagesByYear.length === 0 && (
                    <p className="font-mono text-sm font-bold tracking-wider text-muted-foreground uppercase">
                      {t.preview.noLanguageData}
                    </p>
                  )}
                  {displayData.languagesByYear.map((year) => (
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
                    commits={displayData.milestones}
                    emptyLabel={t.preview.noCommits}
                    locale={locale}
                  />
                </CardContent>
                <CardHeader className="space-y-4 border-t-2 border-foreground pt-4">
                  <CardTitle>{t.preview.latestCommits}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CommitList
                    commits={displayData.latestMilestones}
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
