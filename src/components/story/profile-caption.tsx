"use client";

import { useLocale } from "@/components/locale/locale-provider";
import {
  profileBio,
  profileCaptionParts,
  profileDisplayName,
} from "@/components/story/profile-identity";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { cn } from "@/lib/utils";

export function ProfileCaption({
  data,
  className,
  align = "left",
  showBio = true,
}: {
  data: Pick<StoryDataSnapshot, "username" | "name" | "memberSince" | "profile">;
  className?: string;
  align?: "left" | "center";
  showBio?: boolean;
}) {
  const { t } = useLocale();
  const displayName = profileDisplayName(data);
  const { handle, since } = profileCaptionParts(data, t.story.portraitSince);
  const bio = profileBio(data);

  return (
    <div
      className={cn(
        "min-w-0",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {displayName ? (
        <p className="font-heading text-xl leading-none font-black tracking-normal text-balance sm:text-2xl">
          {displayName}
        </p>
      ) : null}
      <p
        className={cn(
          "font-mono text-xs font-bold tracking-[0.2em] whitespace-nowrap text-muted-foreground uppercase",
          displayName ? "mt-1.5" : "text-foreground",
        )}
      >
        {handle}
        {since ? (
          <span className="text-muted-foreground">
            <span className="mx-1.5 text-foreground/35">·</span>
            {since}
          </span>
        ) : null}
      </p>
      {showBio && bio ? (
        <p className="mt-1.5 max-w-xs text-sm leading-snug text-pretty text-muted-foreground line-clamp-3 sm:max-w-sm">
          {bio}
        </p>
      ) : null}
    </div>
  );
}
