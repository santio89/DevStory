"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { StoryContent } from "@/components/story/story-content";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import {
  Check,
  Copy,
  Download,
  Link2,
  Loader2,
  Mail,
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
    "— written by Your Dev Story",
  ].join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StoryView({
  story,
  mode,
  storyId,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  storyId: string | null;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  async function copyStory() {
    try {
      await navigator.clipboard.writeText(storyToText(story));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function downloadStory() {
    const blob = new Blob([JSON.stringify(story, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "devstory.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyLink() {
    if (!storyId) return;
    const url = new URL(`/story/${storyId}`, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
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
    ...new Set(story.eras.flatMap((era) => era.keyLanguages)),
  ];

  return (
    <div className="space-y-10">
      <StoryContent story={story} mode={mode} />

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
                <h4 className="font-heading text-lg font-black tracking-tight uppercase">
                  {t.share.title}
                </h4>
              </div>
              <p className="mt-1.5 max-w-md text-sm text-white/80">
                {t.share.erasLabel(story.eras.length)},{" "}
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
              <Button
                variant="outline"
                onClick={downloadStory}
                className="border-white bg-transparent text-white shadow-none hover:bg-white/10"
              >
                <Download />
                {t.share.downloadJson}
              </Button>
              <Button
                variant="outline"
                onClick={() => void copyLink()}
                disabled={!storyId}
                className="border-white bg-transparent text-white shadow-none hover:bg-white/10"
              >
                {linkCopied ? <Check /> : <Link2 />}
                {linkCopied ? t.share.linkCopied : t.share.copyLink}
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t-2 border-white/30 pt-6">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-bauhaus-yellow" />
              <h5 className="font-heading text-sm font-bold tracking-tight uppercase">
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
    </div>
  );
}