import { describe, expect, it } from "vitest";
import {
  minifyBrainSnapshot,
  minifyDevStory,
  normalizeBrainSnapshot,
  snapshotToPreview,
  summarizeStoryData,
} from "@/lib/devstory/minify";
import { buildFixtureData } from "../test-fixtures";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

describe("minify pipeline (snapshot -> compact JSON for the AI / story pages)", () => {
  it("round-trips a rich snapshot into a compact self-describing payload", () => {
    const data = buildFixtureData();
    const snapshot = summarizeStoryData(data);

    // The compact JSON is parseable and contains the fingerprint + core facts.
    const compact = minifyBrainSnapshot(snapshot);
    const parsed = JSON.parse(compact) as Record<string, unknown>;

    expect(typeof parsed.narrativeFingerprint).toBe("object");
    expect(
      (parsed.narrativeFingerprint as { metaphorLens: string }).metaphorLens,
    ).toBeTruthy();
    expect((parsed.user as { username: string }).username).toBe("octonaught");
    expect((parsed.summary as { repos: number }).repos).toBe(data.totals.repoCount);

    // normalizeBrainSnapshot is a no-op for already-normalized data.
    expect(normalizeBrainSnapshot(snapshot)).toEqual(snapshot);

    // Legacy snapshots miss optional fields; normalize backfills them.
    const legacy = JSON.parse(JSON.stringify(snapshot)) as StoryDataSnapshot;
    delete (legacy as unknown as Record<string, unknown>).latestMilestones;
    (legacy.totals as unknown as Record<string, unknown>).forks = undefined;
    const normalized = normalizeBrainSnapshot(legacy);
    expect(normalized.latestMilestones).toEqual([]);
    expect(normalized.totals.forks).toBe(0);

    // snapshotToPreview exposes the summary numbers used by the landing preview.
    const preview = snapshotToPreview(snapshot);
    expect(preview.totals.repoCount).toBe(data.totals.repoCount);
    expect(preview.username).toBe("octonaught");

    // Repos serialize in chronological order and nothing critical is omitted.
    const direct = JSON.parse(minifyDevStory(data)) as {
      allReposChronological: { name: string; created: string }[];
      reposOmitted: number;
    };
    expect(direct.allReposChronological[0].name).toBe("hello-world");
    expect(direct.allReposChronological).toContainEqual(
      expect.objectContaining({ name: "tide" }),
    );
    expect(direct.reposOmitted).toBe(0);
  });
});