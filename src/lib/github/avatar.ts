import type { StoryDataSnapshot } from "@/lib/devstory/minify";

/** Public GitHub avatar — works without login. */
export function resolveGitHubAvatar(
  snapshot: Pick<StoryDataSnapshot, "username" | "avatarUrl"> | null | undefined,
): string | null {
  if (!snapshot?.username) return null;
  const fromBrain = snapshot.avatarUrl?.trim();
  if (fromBrain) return fromBrain;
  return `https://github.com/${snapshot.username}.png`;
}

export function portraitInitials(
  snapshot: Pick<StoryDataSnapshot, "username" | "name"> | null | undefined,
): string {
  if (!snapshot) return "?";
  const source = snapshot.name?.trim() || snapshot.username;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
