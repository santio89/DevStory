export const siteName = "Dev Story";
export const siteDescription =
  "Any public GitHub username. Their code. Their story. A narrative timeline from commit history.";
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdevstory.vercel.app"
).replace(/\/+$/, "");