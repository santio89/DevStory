export const siteName = "DevStory";
export const siteDescription =
  "Any public GitHub username. Their code. Their story. A narrative timeline from commit history.";
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdevstory.vercel.app"
).replace(/\/+$/, "");

/** Always use the public app URL for share/email links (never localhost). */
export function publicUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function shareStoryPath(storyId: string, locale: string): string {
  return `/story/${storyId}?lang=${locale}`;
}

export function shareUsernamePath(username: string, locale: string): string {
  return `/?u=${encodeURIComponent(username)}&lang=${locale}`;
}

export function shareStoryUrl(storyId: string, locale: string): string {
  return publicUrl(shareStoryPath(storyId, locale));
}

export function shareUsernameUrl(username: string, locale: string): string {
  return publicUrl(shareUsernamePath(username, locale));
}