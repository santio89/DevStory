import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#121212",
          gap: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 200,
            height: 200,
            backgroundColor: "#1040c0",
            border: "6px solid #f0f0f0",
            boxShadow: "8px 8px 0 0 #f0f0f0",
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "monospace",
              letterSpacing: "-0.05em",
            }}
          >
            {"{ }"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 900,
            color: "#f0f0f0",
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
          }}
        >
          Dev<span style={{ color: "#1040c0" }}>Story</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
