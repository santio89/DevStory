import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonBar } from "@/components/ui/skeleton-bar";

function BrainStatSkeleton({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      className={`flex min-h-[5.5rem] flex-col justify-between gap-2 rounded-none border-2 border-foreground p-3 shadow-hard-sm ${
        highlight ? "bg-bauhaus-yellow/40" : "bg-background"
      }`}
    >
      <SkeletonBar className="size-4" />
      <div className="space-y-2">
        <SkeletonBar className="h-6 w-12" />
        <SkeletonBar className="h-3 w-16" />
      </div>
    </div>
  );
}

export function BrainPreviewSkeleton({
  statusLabel,
}: {
  statusLabel?: string;
}) {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      {statusLabel ? (
        <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {statusLabel}
        </p>
      ) : null}

      <div className="rounded-none border-2 border-foreground bg-card p-4 shadow-hard sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center">
            <SkeletonBar className="size-20 shrink-0 sm:size-24" />
            <div className="w-full space-y-2 sm:flex-1">
              <SkeletonBar className="mx-auto h-4 w-28 sm:mx-0" />
              <SkeletonBar className="mx-auto h-3 w-36 sm:mx-0" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-4/5" />
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3 border-t-2 border-foreground pt-4 lg:w-[min(100%,34rem)] lg:shrink-0 lg:grid-cols-4 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-5 xl:w-[36rem]">
            <BrainStatSkeleton />
            <BrainStatSkeleton highlight />
            <BrainStatSkeleton />
            <BrainStatSkeleton />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="h-full bg-card shadow-hard">
          <CardHeader>
            <SkeletonBar className="h-4 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <SkeletonBar className="h-3 w-12" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonBar key={i} className="h-6 w-18" />
              ))}
            </div>
            <SkeletonBar className="h-3 w-12" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonBar key={i} className="h-6 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full bg-card shadow-hard">
          <CardHeader>
            <SkeletonBar className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 border-l-4 border-foreground/20 pl-3">
                <div className="flex gap-2">
                  <SkeletonBar className="h-3 w-14" />
                  <SkeletonBar className="h-3 w-20" />
                </div>
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BiographerSkeleton({
  statusLabel,
}: {
  statusLabel: string;
}) {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="relative rounded-none border-2 border-foreground bg-card px-6 py-10 shadow-hard sm:px-12 sm:py-14">
        <span className="pointer-events-none absolute top-6 right-6 size-8 rounded-full border-2 border-foreground bg-bauhaus-sky/30" />
        <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {statusLabel}
        </p>
        <div className="mt-8 max-w-3xl space-y-3">
          <SkeletonBar className="h-7 w-3/4" />
          <SkeletonBar className="h-4 w-1/2" />
        </div>
        <div className="mt-8 max-w-2xl space-y-2.5">
          <SkeletonBar className="w-full" />
          <SkeletonBar className="w-full" />
          <SkeletonBar className="w-2/3" />
        </div>
      </div>

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            <article
              className={`relative rounded-none border-2 border-foreground bg-card p-6 shadow-hard sm:p-7 ${
                i % 2 === 0 ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14"
              }`}
            >
              <div className="flex items-center gap-3">
                <SkeletonBar className="h-3 w-24" />
                <span className="h-0.5 flex-1 bg-foreground/15" />
                <SkeletonBar className="h-3 w-16" />
              </div>
              <div className="mt-4 space-y-2">
                <SkeletonBar className="w-1/2" />
                <SkeletonBar className="w-full" />
                <SkeletonBar className="w-3/4" />
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
