"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { normalizeBrainSnapshot, type StoryDataSnapshot } from "@/lib/devstory/minify";

type BrainContextValue = {
  brain: StoryDataSnapshot | null;
  brainLoading: boolean;
  brainError: string | null;
  refreshBrain: (force?: boolean) => Promise<StoryDataSnapshot | null>;
  setBrain: (brain: StoryDataSnapshot | null) => void;
};

const BrainContext = createContext<BrainContextValue | null>(null);

export function BrainProvider({
  username,
  initialBrain = null,
  autoFetch = true,
  children,
}: {
  username: string;
  initialBrain?: StoryDataSnapshot | null;
  autoFetch?: boolean;
  children: ReactNode;
}) {
  const [brain, setBrainState] = useState<StoryDataSnapshot | null>(() =>
    initialBrain ? normalizeBrainSnapshot(initialBrain) : null,
  );
  const [brainLoading, setBrainLoading] = useState(false);
  const [brainError, setBrainError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const setBrain = useCallback((next: StoryDataSnapshot | null) => {
    setBrainState(next ? normalizeBrainSnapshot(next) : null);
    setBrainError(null);
  }, []);

  const refreshBrain = useCallback(
    async (force = false): Promise<StoryDataSnapshot | null> => {
      const fetchId = ++fetchIdRef.current;
      setBrainLoading(true);
      setBrainError(null);
      try {
        const params = new URLSearchParams({ username });
        if (force) params.set("refresh", "1");
        const res = await fetch(`/api/story?${params}`, { cache: "no-store" });
        const json = (await res.json()) as {
          brain?: StoryDataSnapshot;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error ?? `Brain fetch failed (${res.status})`);
        }
        if (!json.brain) {
          throw new Error("Brain fetch returned no data.");
        }
        const normalized = normalizeBrainSnapshot(json.brain);
        if (fetchId === fetchIdRef.current) {
          setBrainState(normalized);
        }
        return normalized;
      } catch (error) {
        if (fetchId === fetchIdRef.current) {
          setBrainError(
            error instanceof Error ? error.message : "Brain fetch failed.",
          );
        }
        return null;
      } finally {
        if (fetchId === fetchIdRef.current) {
          setBrainLoading(false);
        }
      }
    },
    [username],
  );

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    queueMicrotask(() => {
      if (fetchId !== fetchIdRef.current) return;
      setBrainError(null);
      if (initialBrain) {
        setBrainState(normalizeBrainSnapshot(initialBrain));
      } else {
        setBrainState(null);
      }
      if (!autoFetch || initialBrain) {
        setBrainLoading(false);
        return;
      }
      void refreshBrain(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const value = useMemo(
    () => ({
      brain,
      brainLoading,
      brainError,
      refreshBrain,
      setBrain,
    }),
    [brain, brainLoading, brainError, refreshBrain, setBrain],
  );

  return (
    <BrainContext.Provider value={value}>{children}</BrainContext.Provider>
  );
}

export function useBrain() {
  const ctx = useContext(BrainContext);
  if (!ctx) {
    throw new Error("useBrain must be used within BrainProvider");
  }
  return ctx;
}

export function useOptionalBrain() {
  return useContext(BrainContext);
}
