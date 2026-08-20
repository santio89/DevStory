import { ImageResponse } from "next/og";
import { getStory } from "@/lib/stories";

export const alt = "Your Dev Story";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#121212";
const PAPER = "#f0f0f0";
const YELLOW = "#f0c020";
const CYAN = "#22d3ee";
const PINK = "#f9a8d4";
const DEEP = "#1040c0";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getStory(id);

  if (!row) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          background: INK,
          color: PAPER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: MONO,
        }}
      >
        <div style={{ color: YELLOW, fontSize: 24, letterSpacing: 8 }}>{"{ }"}</div>
        <div style={{ fontSize: 48, fontWeight: 900 }}>Your Dev Story</div>
      </div>,
      size,
    );
  }

  const story = row.story;
  const eraCount = story.eras.length;
  const badge = `${eraCount} ERAS · ${row.username.toUpperCase()}${story.archetype ? ` · ${story.archetype.toUpperCase()}` : ""}`;
  const summary =
    story.summary.length > 220 ? `${story.summary.slice(0, 217)}…` : story.summary;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: INK,
        color: PAPER,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          background: YELLOW,
          transform: "rotate(12deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: 90,
          width: 150,
          height: 150,
          borderRadius: 9999,
          border: `6px solid ${CYAN}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 90,
          left: -40,
          width: 90,
          height: 90,
          borderRadius: 9999,
          background: PINK,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 140,
          width: 26,
          height: 26,
          background: DEEP,
          transform: "rotate(45deg)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "72px 96px",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: DEEP,
              border: `4px solid ${PAPER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: PAPER,
            }}
          >
            {"{ }"}
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, fontWeight: 700 }}>
            YOUR DEV STORY
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 8,
              color: YELLOW,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            {badge}
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              maxWidth: 900,
            }}
          >
            {story.title}
          </div>
          {story.summary && (
            <div
              style={{
                marginTop: 24,
                fontSize: 24,
                lineHeight: 1.4,
                color: "#bdbdbd",
                maxWidth: 820,
              }}
            >
              {summary}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            {[YELLOW, CYAN, PINK, DEEP].map((c) => (
              <div
                key={c}
                style={{ width: 26, height: 26, background: c, transform: "rotate(45deg)" }}
              />
            ))}
          </div>
          <div style={{ fontSize: 20, letterSpacing: 4, color: PAPER, fontWeight: 700 }}>
            COMMITS ARE LETTERS, REPOS ARE CHAPTERS
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}