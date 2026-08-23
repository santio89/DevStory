"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion/fade-in";
import { ShareMenu } from "@/components/story/share-menu";
import { ShareOrbitIcon } from "@/components/story/story-decorations";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { publicUrl } from "@/lib/site";
import { resolveGitHubAvatar } from "@/lib/github/avatar";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  Send,
  Share2,
} from "lucide-react";

function storyToText(story: DevStory, subject: string): string {
  return [
    story.title,
    "",
    story.summary,
    "",
    ...story.eras.flatMap((era) => [
      `${era.year} - ${era.name}`,
      era.description,
      "",
    ]),
    ...(story.closing ? [story.closing, ""] : []),
    `- ${subject}`,
  ].join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StorySharePanel({
  story,
  storyId,
  username,
  displayName,
  brain = null,
}: {
  story: DevStory;
  storyId?: string | null;
  username: string;
  displayName: string;
  brain?: StoryDataSnapshot | null;
}) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const sharePath = storyId
    ? `/story/${storyId}`
    : `/?u=${encodeURIComponent(username)}`;
  const shareUrl = publicUrl(sharePath);

  const shareSubject = t.share.subjectFor(displayName);

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(storyToText(story, shareSubject));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailStatus("loading");
    setEmailError(null);
    try {
      const res = await fetch("/api/story/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          story,
          displayName,
          storyId,
          locale,
          avatarUrl: resolveGitHubAvatar(brain ?? { username, avatarUrl: null }),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? t.share.emailFailed);
      }
      setEmailStatus("success");
    } catch (e) {
      setEmailStatus("error");
      setEmailError(
        e instanceof Error ? e.message : t.preview.genericError,
      );
    }
  }

  return (
    <Reveal
      variant="subtle"
      className="relative overflow-visible rounded-none border-2 border-foreground bg-bauhaus-deep p-6 text-white shadow-hard-lg sm:p-8"
    >
      <span className="pointer-events-none absolute top-5 left-5 size-3 rotate-45 rounded-none bg-bauhaus-yellow" />
      <ShareOrbitIcon className="pointer-events-none absolute -top-4 -right-4 size-28 text-white/30" />
      <div className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-bauhaus-yellow" />
              <h4 className="font-heading text-lg font-black tracking-normal text-balance uppercase">
                {t.share.title}
              </h4>
            </div>
            <p className="mt-1.5 max-w-md text-sm text-pretty text-white/80">
              {t.share.blurbFor(username)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => void copyStory()}
              className="bg-white text-bauhaus-deep hover:bg-bauhaus-paper"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? t.share.copied : t.share.copyText}
            </Button>
            <ShareMenu
              url={shareUrl}
              text={`${story.title} - ${t.common.shareTagline}`}
              buttonClassName="border-white bg-transparent text-white shadow-none hover:bg-white/10"
            />
          </div>
        </div>

        <div className="mt-6 border-t-2 border-white/30 pt-6">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-bauhaus-yellow" />
            <h5 className="font-heading text-sm font-bold tracking-normal text-balance uppercase">
              {t.share.emailTitle}
            </h5>
          </div>

          {emailStatus === "success" ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="font-mono text-sm font-bold text-bauhaus-yellow">
                {t.share.emailSuccess}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmailStatus("idle");
                  setEmail("");
                }}
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                {t.share.sendAnother}
              </Button>
            </div>
          ) : emailStatus === "loading" ? (
            <div
              className="mt-3 flex items-center gap-3 font-mono text-sm font-bold tracking-wider text-bauhaus-yellow uppercase"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="size-4 shrink-0 animate-spin" />
              {t.share.sending}
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleEmail(e)}
              className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.share.emailPlaceholder}
                aria-label={t.share.emailAriaLabel}
                className="h-10 flex-1 rounded-none border-2 border-foreground bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-bauhaus-deep focus:outline-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!EMAIL_PATTERN.test(email)}
                className="bg-bauhaus-yellow text-bauhaus-ink hover:bg-bauhaus-yellow/90"
              >
                <Send className="size-4" />
                {t.share.send}
              </Button>
            </form>
          )}

          {emailStatus === "error" && emailError && (
            <p className="mt-2 font-mono text-xs font-bold text-bauhaus-yellow">
              {emailError}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}
