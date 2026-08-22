"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { StoryContent } from "@/components/story/story-content";
import { StoryMoment } from "@/components/story/story-moment";
import { ShareMenu } from "@/components/story/share-menu";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
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
      `${era.year} — ${era.name}`,
      era.description,
      "",
    ]),
    ...(story.closing ? [story.closing, ""] : []),
    `— ${subject}`,
  ].join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StoryView({
  story,
  mode,
  username,
  displayName,
  data = null,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  username: string;
  displayName: string;
  data?: StoryDataSnapshot | null;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const fingerprint = story.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");

  const shareUrl =
    typeof window !== "undefined"
      ? new URL(`/?u=${encodeURIComponent(username)}`, window.location.origin)
          .href
      : `/?u=${encodeURIComponent(username)}`;

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

  const allLanguages = [
    ...new Set(story.eras.flatMap((era) => era.keyLanguages)),
  ];

  return (
    <div className="space-y-10">
      <StoryContent story={story} mode={mode} data={data} />

      <StoryMoment story={story} data={data} fingerprint={fingerprint} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-none border-2 border-foreground bg-bauhaus-deep p-6 text-white shadow-hard-lg sm:p-8"
      >
        <span className="pointer-events-none absolute top-5 left-5 size-3 rotate-45 rounded-none bg-bauhaus-yellow" />
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
                {t.share.blurbFor(displayName)} · {t.share.erasLabel(story.eras.length)}
                {allLanguages.length > 0
                  ? ` · ${allLanguages.join(" → ")}`
                  : ` · ${t.share.noLanguages}`}
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
                text={`${story.title} — ${t.common.shareTagline}`}
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
                  disabled={emailStatus === "loading"}
                  aria-label={t.share.emailAriaLabel}
                  className="h-10 flex-1 rounded-none border-2 border-foreground bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-bauhaus-deep focus:outline-none disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    emailStatus === "loading" || !EMAIL_PATTERN.test(email)
                  }
                  className="bg-bauhaus-yellow text-bauhaus-ink hover:bg-bauhaus-yellow/90"
                >
                  {emailStatus === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {emailStatus === "loading"
                    ? t.share.sending
                    : t.share.send}
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
      </motion.div>
    </div>
  );
}
