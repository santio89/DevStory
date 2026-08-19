"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { StoryContent } from "@/components/story/story-content";
import { Button } from "@/components/ui/button";
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
    "— written by DevStory",
  ].join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function StoryView({
  story,
  mode,
  storyId,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  storyId: string | null;
}) {
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
        throw new Error(json.error ?? "Couldn't send the email.");
      }
      setEmailStatus("success");
    } catch (e) {
      setEmailStatus("error");
      setEmailError(e instanceof Error ? e.message : "Something went wrong.");
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
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/[0.08] via-transparent to-blue-500/[0.08] p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-amber-400" />
                <h4 className="font-heading text-lg font-semibold tracking-tight">
                  Share your DevStory
                </h4>
              </div>
              <p className="mt-1.5 max-w-md text-sm text-zinc-400">
                {story.eras.length} eras,{" "}
                {allLanguages.length > 0
                  ? `${allLanguages.join(" → ")}`
                  : "no languages"}
                . Your invisible hours, validated.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void copyStory()}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied!" : "Copy as text"}
              </Button>
              <Button variant="outline" onClick={downloadStory}>
                <Download />
                Download JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => void copyLink()}
                disabled={!storyId}
              >
                {linkCopied ? <Check /> : <Link2 />}
                {linkCopied ? "Link copied!" : "Copy link"}
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-amber-400" />
              <h5 className="font-heading text-sm font-semibold tracking-tight">
                Email me my story
              </h5>
            </div>

            {emailStatus === "success" ? (
              <p className="mt-3 font-mono text-sm text-emerald-400">
                Check your inbox — the story is on its way.
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
                  placeholder="you@example.com"
                  disabled={emailStatus === "loading" || !storyId}
                  aria-label="Email address"
                  className="h-9 flex-1 rounded-lg border border-border/60 bg-zinc-900/60 px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-400/50 focus:outline-none disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    emailStatus === "loading" ||
                    !storyId ||
                    !EMAIL_PATTERN.test(email)
                  }
                >
                  {emailStatus === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {emailStatus === "loading" ? "Sending…" : "Send it"}
                </Button>
              </form>
            )}

            {emailStatus === "error" && emailError && (
              <p className="mt-2 font-mono text-xs text-destructive">
                {emailError}
              </p>
            )}

            {!storyId && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Sign in and generate a story to unlock sharing and email.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}