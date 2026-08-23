import { render } from "react-email";
import { DevStoryEmail } from "@/components/emails/devstory-email";
import type { DevStory } from "@/lib/devstory/story";
import { resolveGitHubAvatar } from "@/lib/github/avatar";
import {
  EmailSendError,
  getActiveEmailProvider,
  hasEmailProviderConfigured,
  sendTransactionalEmail,
} from "@/lib/email/provider";

export { EmailSendError, getActiveEmailProvider };

export function hasEmailConfigured(): boolean {
  return hasEmailProviderConfigured();
}

export async function sendStoryEmail({
  to,
  story,
  subject,
  ps,
  username,
  handle,
  avatarUrl,
  storyUrl,
}: {
  to: string;
  story: DevStory;
  subject: string;
  ps: string;
  username: string;
  handle: string;
  avatarUrl?: string | null;
  storyUrl: string;
}) {
  const email = DevStoryEmail({
    title: story.title,
    summary: story.summary,
    eras: story.eras,
    username,
    handle,
    avatarUrl,
    ps,
    storyUrl,
  });
  const html = await render(email);
  const text = await render(email, { plainText: true });

  await sendTransactionalEmail({
    to,
    subject,
    html,
    text,
  });
}
