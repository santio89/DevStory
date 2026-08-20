export const siteName = "Your Dev Story";
export const siteDescription =
  "Your code. Your story. Connect GitHub to see your invisible hours.";
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdevstory.vercel.app"
).replace(/\/+$/, "");