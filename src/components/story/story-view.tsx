"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { StoryContent } from "@/components/story/story-content";
import { StoryRetell } from "@/components/story/story-retell";
import { StoryMoment } from "@/components/story/story-moment";
import { StoryChat } from "@/components/story/story-chat";
import { ShareMenu } from "@/components/story/share-menu";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { RemixVoice } from "@/lib/devstory/ai";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  RotateCcw,
  Send,
  Share2,
} from "lucide-react";

function storyToText(story: DevStory): string {
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
    "— written by Your Dev Story",
  ].join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StoryView({
  story,
  mode,
  storyId,
  data = null,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  storyId: string | null;
  data?: StoryDataSnapshot | null;
}) {
  const { t, locale } = useLocale();
  const storyTopRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [remix, setRemix] = useState<{ voice: RemixVoice; story: DevStory } | null>(
    null,
  );

  const displayStory = remix?.story ?? story;
  const shareUrl = storyId
    ? new URL(`/story/${storyId}`, window.location.origin).href
    : null;

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(storyToText(displayStory));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleRemix(voice: RemixVoice) {
    const res = await fetch("/api/story/remix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story, voice, locale }),
    });
    if (!res.ok) {
      throw new Error(String(res.status));
    }
    const json = (await res.json()) as { story: DevStory };
    setRemix({ voice, story: json.story });
    requestAnimationFrame(() => {
      storyTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyId) return;
    setEmailStatus("loading");
    setEmailError(null);
    try {
      const res = await fetch("/api/story/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, email }),
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
    ...new Set(displayStory.eras.flatMap((era) => era.keyLanguages)),
  ];

  return (
    <div className="space-y-10">
      <div ref={storyTopRef} className="scroll-mt-6 space-y-10">
        {remix && (
          <div className="flex items-center justify-between gap-3 rounded-none border-2 border-foreground bg-bauhaus-cyan/15 px-4 py-3 shadow-hard-sm">
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase">
              {t.play.remixedAs(t.play.voice[remix.voice])}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRemix(null)}
            >
              <RotateCcw className="size-3.5" />
              {t.play.restore}
            </Button>
          </div>
        )}

        <StoryContent story={displayStory} mode={mode} data={data} />
      </div>

      <StoryMoment story={displayStory} data={data} />

      <StoryRetell remix={remix} onRemix={(voice) => handleRemix(voice)} />

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
                <h4 className="font-heading text-lg font-black tracking-normal uppercase">
                  {t.share.title}
                </h4>
              </div>
              <p className="mt-1.5 max-w-md text-sm text-white/80">
                {t.share.erasLabel(displayStory.eras.length)},{" "}
                {allLanguages.length > 0
                  ? `${allLanguages.join(" → ")}`
                  : t.share.noLanguages}
                . {t.common.shareTagline}.
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
              {shareUrl && (
                <ShareMenu
                  url={shareUrl}
                  text={`${displayStory.title} — ${t.common.shareTagline}`}
                  buttonClassName="border-white bg-transparent text-white shadow-none hover:bg-white/10"
                />
              )}
            </div>
          </div>

          <div className="mt-6 border-t-2 border-white/30 pt-6">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-bauhaus-yellow" />
              <h5 className="font-heading text-sm font-bold tracking-normal uppercase">
                {t.share.emailTitle}
              </h5>
            </div>

            {emailStatus === "success" ? (
              <p className="mt-3 font-mono text-sm font-bold text-bauhaus-yellow">
                {t.share.emailSuccess}
              </p>
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
                  disabled={emailStatus === "loading" || !storyId}
                  aria-label="Email address"
                  className="h-10 flex-1 rounded-none border-2 border-foreground bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-bauhaus-deep focus:outline-none disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    emailStatus === "loading" ||
                    !storyId ||
                    !EMAIL_PATTERN.test(email)
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

            {!storyId && (
              <p className="mt-2 font-mono text-xs text-white/70">
                {t.share.unlock}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <StoryChat story={displayStory} data={data} />
    </div>
  );
}