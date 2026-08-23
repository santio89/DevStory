import type { StoryDataSnapshot } from "./minify";

export function developerProfileBio(
  data: Pick<StoryDataSnapshot, "profile">,
): string | null {
  const bio = data.profile.bio?.trim();
  return bio || null;
}

/** Hide bio in UI only when it duplicates the display name exactly. */
export function profileBioForDisplay(
  data: Pick<StoryDataSnapshot, "username" | "name" | "profile">,
): string | null {
  const bio = developerProfileBio(data);
  if (!bio) return null;
  const name = data.name?.trim();
  if (name && bio.toLowerCase() === name.toLowerCase()) return null;
  return bio;
}

export function profileDisplayName(
  data: Pick<StoryDataSnapshot, "username" | "name">,
): string | null {
  const name = data.name?.trim();
  if (!name) return null;
  if (name.toLowerCase() === data.username.toLowerCase()) return null;
  return name;
}

export function buildDeveloperProfileContext(
  snapshot: Pick<
    StoryDataSnapshot,
    "username" | "name" | "memberSince" | "profile"
  >,
): string {
  const bio = developerProfileBio(snapshot);
  return [
    `Name: ${snapshot.name} (@${snapshot.username})`,
    bio
      ? `Bio (their own words — treat as a primary signal for who they are): ${bio}`
      : null,
    snapshot.profile.location ? `Location: ${snapshot.profile.location}` : null,
    snapshot.profile.company ? `Company: ${snapshot.profile.company}` : null,
    snapshot.profile.blog ? `Website: ${snapshot.profile.blog}` : null,
    snapshot.memberSince
      ? `On GitHub since: ${snapshot.memberSince.slice(0, 10)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}
