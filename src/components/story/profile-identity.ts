import {
  profileBioForDisplay,
  profileDisplayName,
} from "@/lib/devstory/profile";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

export { profileBioForDisplay as profileBio, profileDisplayName };

export function profileCaptionParts(
  data: Pick<StoryDataSnapshot, "username" | "memberSince">,
  sinceLabel: (year: string) => string,
): { handle: string; since: string | null } {
  const sinceYear = data.memberSince?.slice(0, 4) ?? null;
  return {
    handle: `@${data.username}`,
    since: sinceYear ? sinceLabel(sinceYear) : null,
  };
}
