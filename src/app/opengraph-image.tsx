import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#050814";
const PAPER = "#f0f4fa";
const FLARE = "#ff4a1c";
const ASH = "#7a94c7";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* Vermilion edge — the one accent, used as a rule not a glow. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 14,
            height: "100%",
            backgroundColor: FLARE,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 3,
            color: ASH,
            textTransform: "uppercase",
          }}
        >
          <span>{site.wordmark}</span>
          <span>{site.location.label}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 108,
              lineHeight: 0.9,
              fontWeight: 900,
              color: PAPER,
              letterSpacing: -4,
              textTransform: "uppercase",
            }}
          >
            Make a little
          </div>
          <div
            style={{
              fontSize: 108,
              lineHeight: 0.9,
              fontWeight: 900,
              color: FLARE,
              letterSpacing: -4,
              textTransform: "uppercase",
            }}
          >
            noise.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: PAPER,
          }}
        >
          <span style={{ maxWidth: 760 }}>
            Motion graphics, video ads and search strategy. An initial example in
            one day.
          </span>
          <span style={{ fontSize: 20, color: ASH, letterSpacing: 2 }}>
            THREE PEOPLE
          </span>
        </div>
      </div>
    ),
    size,
  );
}
