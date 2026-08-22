"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { Loader2, Search } from "lucide-react";

export function HeroLookup({
  username,
  loading = false,
  onLookup,
}: {
  username: string | null;
  loading?: boolean;
  onLookup: (username: string) => void;
}) {
  const { t } = useLocale();
  const [value, setValue] = useState(username ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const normalized = normalizeGitHubUsername(value);
    if (!isValidGitHubUsername(normalized)) {
      setError(t.hero.invalidUsername);
      return;
    }
    setError(null);
    onLookup(normalized.toLowerCase());
  }

  return (
    <form
      onSubmit={submit}
      className="pointer-events-auto mx-auto w-full max-w-[20rem] sm:max-w-md"
    >
      <div className="mr-1 mb-1 flex w-full items-stretch justify-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder={t.hero.lookupPlaceholder}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={loading}
          aria-label={t.hero.lookupPlaceholder}
          aria-busy={loading}
          className="h-11 min-w-0 flex-1 rounded-none border-2 border-foreground bg-background px-3 font-mono text-sm text-foreground shadow-hard-sm placeholder:text-muted-foreground focus:border-bauhaus-deep focus:outline-none disabled:opacity-60"
        />
        <Button type="submit" size="lg" className="shrink-0" disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search />
          )}
          {loading ? t.hero.lookupLoading : t.hero.lookupButton}
        </Button>
      </div>
      {loading && (
        <p className="mt-3 flex items-center justify-center gap-2 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Loader2 className="size-3.5 animate-spin text-bauhaus-deep" />
          {t.preview.harvestingFor(normalizeGitHubUsername(value) || "…")}
        </p>
      )}
      {error && (
        <p className="mt-2 text-center font-mono text-xs font-bold text-destructive uppercase">
          {error}
        </p>
      )}
    </form>
  );
}
