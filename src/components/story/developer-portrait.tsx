"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale/locale-provider";
import { portraitInitials, resolveGitHubAvatar } from "@/lib/github/avatar";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-14",
  md: "size-20",
  lg: "size-28 sm:size-32",
  timeline: "size-[4.5rem] sm:size-24",
} as const;

export function DeveloperPortrait({
  data,
  size = "md",
  showHandle = false,
  className,
}: {
  data: Pick<StoryDataSnapshot, "username" | "name" | "avatarUrl" | "memberSince"> | null;
  size?: keyof typeof sizeClasses;
  showHandle?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const [broken, setBroken] = useState(false);
  const src = resolveGitHubAvatar(data);
  const initials = portraitInitials(data);
  const sinceYear = data?.memberSince?.slice(0, 4);

  if (!data) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <span
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground"
          aria-hidden
        />
        <div
          className={cn(
            "relative overflow-hidden border-2 border-foreground bg-card shadow-hard-sm",
            sizeClasses[size],
          )}
        >
          {src && !broken ? (
            <img
              src={src}
              alt={data.name?.trim() || data.username}
              className="size-full object-cover contrast-[1.04] saturate-[1.05]"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-bauhaus-deep font-mono text-lg font-black text-white">
              {initials}
            </div>
          )}
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-bauhaus-yellow"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute top-1 right-1 size-2 border border-foreground bg-bauhaus-cyan"
            aria-hidden
          />
        </div>
      </div>

      {showHandle ? (
        <div className="text-center">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-foreground uppercase">
            @{data.username}
          </p>
          {sinceYear ? (
            <p className="mt-0.5 font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {t.story.portraitSince(sinceYear)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
