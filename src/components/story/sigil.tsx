"use client";

import type { Era } from "@/lib/devstory/story";
import {
  pickTokenForName,
  TOKEN_IDS,
  type TokenId,
} from "@/lib/devstory/tokens";

const ACCENT = "#22d3ee";
const STROKE = "var(--bauhaus-sky)";

/** Optical centering nudges — icons are authored in 64×64 but not all sit on the visual midpoint. */
export const SIGIL_NUDGE: Record<TokenId, string> = {
  sprout: "translate(0 -6)",
  spark: "translate(0 0)",
  frame: "translate(0 1)",
  bridge: "translate(0 -2)",
  flame: "translate(0 0)",
  peak: "translate(0 -1)",
  compass: "translate(0 0)",
  rocket: "translate(0 2)",
  tide: "translate(0 5)",
  labyrinth: "translate(0 0)",
  key: "translate(1 11)",
  roots: "translate(0 2)",
  dawn: "translate(0 3)",
  orbit: "translate(0 0)",
  signal: "translate(0 -7)",
  current: "translate(0 2)",
  forge: "translate(0 2)",
  gate: "translate(0 -2)",
  mirror: "translate(0 2)",
  constellation: "translate(0 2)",
  scroll: "translate(0 0)",
  lens: "translate(0 0)",
  shield: "translate(0 0)",
  thread: "translate(0 0)",
  prism: "translate(0 0)",
  quill: "translate(0 0)",
  anchor: "translate(0 0)",
  pulse: "translate(0 0)",
  beacon: "translate(0 -2)",
  hourglass: "translate(0 0)",
  canyon: "translate(0 1)",
  harbor: "translate(0 2)",
  knot: "translate(0 0)",
  wing: "translate(0 -1)",
  crater: "translate(0 1)",
  mosaic: "translate(0 0)",
  sundial: "translate(0 0)",
  ledger: "translate(0 0)",
  vault: "translate(0 0)",
  circuit: "translate(0 0)",
  lantern: "translate(0 0)",
  helm: "translate(0 0)",
  cascade: "translate(0 2)",
  keystone: "translate(0 -2)",
  chisel: "translate(0 1)",
  spire: "translate(0 -4)",
  vector: "translate(2 0)",
  ember: "translate(0 2)",
  loom: "translate(0 0)",
  echo: "translate(0 0)",
  sonar: "translate(0 -2)",
};

function renderToken(token: TokenId, stroke: string) {
  switch (token) {
    case "sprout":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 47 C18 52 28 53 56 46" />
          <path d="M32 46 V24" />
          <path d="M32 36 C25 30 18 29 13 34 C20 37 27 38 32 42" />
          <path d="M32 27 C39 22 46 23 51 28 C44 30 37 31 32 34" />
        </g>
      );
    case "spark":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 8 L36 28 L56 32 L36 36 L32 56 L28 36 L8 32 L28 28 Z" />
          <path d="M14 18 A26 26 0 0 1 50 14" strokeWidth={1.5} />
          <circle cx="13" cy="16" r="2" fill={ACCENT} stroke="none" />
          <circle cx="52" cy="48" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "frame":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 8 L52 19 L32 30 L12 19 Z" />
          <path d="M12 19 L12 45 L32 56 L32 30 Z" />
          <path d="M52 19 L52 45 L32 56 L32 30 Z" />
        </g>
      );
    case "bridge":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 46 C16 26 25 19 32 19 C39 19 48 26 54 46" />
          <path d="M10 46 H54" />
          <path d="M32 19 V12" />
          <path d="M32 12 C25 18 19 24 18 30" strokeWidth={1.5} />
          <path d="M32 12 C39 18 45 24 46 30" strokeWidth={1.5} />
          <path d="M16 51 C24 57 40 57 48 51" strokeWidth={1.5} strokeDasharray="3 4" />
        </g>
      );
    case "flame":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="23" strokeWidth={1.5} />
          <path d="M32 16 C40 25 43 31 39 38 C35 44 29 44 25 38 C21 31 24 25 32 16 Z" />
          <path d="M32 27 C36 32 37 35 34 39 C31 42 29 42 26 39" strokeWidth={1.5} />
        </g>
      );
    case "peak":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 50 L24 22 L34 36 L42 28 L58 50 Z" />
          <path d="M42 28 V14" />
          <path d="M42 14 L52 17 L42 20 Z" />
          <circle cx="18" cy="17" r="5" strokeWidth={1.5} />
        </g>
      );
    case "compass":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="24" strokeWidth={1.5} />
          <path d="M32 12 L36 27 L32 52 L28 27 Z" />
          <path d="M32 10 V14" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="2.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "rocket":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 8 C38 14 40 21 40 29 L40 39 L24 39 L24 29 C24 21 26 14 32 8 Z" />
          <circle cx="32" cy="27" r="4.5" />
          <path d="M24 35 L15 43 L24 41 Z" />
          <path d="M40 35 L49 43 L40 41 Z" />
          <path d="M29 41 L32 50 L35 41 Z" />
          <path d="M31 53 V56 M33 53 V58" strokeWidth={1.5} />
        </g>
      );
    case "tide":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 30 Q12 24 18 30 T30 30 T42 30 T54 30" />
          <path d="M6 42 Q12 36 18 42 T30 42 T42 42 T54 42" strokeWidth={1.5} />
          <circle cx="50" cy="16" r="6" strokeWidth={1.5} />
          <circle cx="50" cy="16" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "labyrinth":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 32 C32 24 40 22 44 27 C48 32 44 39 36 39 C28 39 23 33 24 26 C25 18 35 16 43 21 C50 26 52 36 45 43" />
          <circle cx="32" cy="32" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "key":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="22" cy="20" r="8" />
          <path d="M30 20 H48" />
          <path d="M41 20 V29" />
          <path d="M47 20 V25" />
          <path d="M37 29 H45" strokeWidth={1.5} />
        </g>
      );
    case "roots":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 28 H54" />
          <path d="M32 28 V44" />
          <path d="M32 36 C25 40 21 43 15 46" strokeWidth={1.5} />
          <path d="M32 42 C39 46 43 48 49 50" strokeWidth={1.5} />
          <path d="M15 46 C12 48 10 50 9 53" strokeWidth={1.5} />
          <path d="M49 50 C52 52 53 54 55 57" strokeWidth={1.5} />
          <path d="M32 28 C32 24 33 21 36 18" strokeWidth={1.5} />
        </g>
      );
    case "dawn":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 36 V10" strokeWidth={1.5} />
          <path d="M21 38 L15 28" strokeWidth={1.5} />
          <path d="M43 38 L49 28" strokeWidth={1.5} />
          <path d="M18 46 A14 14 0 0 1 46 46" />
          <path d="M8 46 H56" />
          <circle cx="32" cy="46" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "orbit":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="32" rx="24" ry="9" />
          <ellipse cx="32" cy="32" rx="9" ry="24" />
          <circle cx="32" cy="32" r="2" fill={ACCENT} stroke="none" />
          <circle cx="50" cy="32" r="2.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "signal":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="46" r="3" fill={ACCENT} stroke="none" />
          <path d="M24 38 A12 12 0 0 1 40 38" />
          <path d="M16 30 A24 24 0 0 1 48 30" />
          <path d="M8 22 A36 36 0 0 1 56 22" strokeWidth={1.5} />
        </g>
      );
    case "current":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20 H46" />
          <path d="M42 16 L48 20 L42 24" />
          <path d="M18 32 H54" />
          <path d="M50 28 L56 32 L50 36" />
          <path d="M10 44 H38" />
          <path d="M34 40 L40 44 L34 48" />
          <circle cx="10" cy="20" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "forge":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 14 L33.5 21 L40 22.5 L33.5 24 L32 31 L30.5 24 L24 22.5 L30.5 21 Z" strokeWidth={1.5} />
          <path d="M16 30 H48" />
          <path d="M18 30 L14 44 H50 L46 30" />
          <path d="M14 44 H50" />
          <path d="M14 48 H50" strokeWidth={1.5} />
          <circle cx="48" cy="18" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "gate":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 50 V28 A16 16 0 0 1 48 28 V50" />
          <path d="M16 40 H48" />
          <path d="M24 32 H44" />
          <path d="M40 28 L46 32 L40 36" />
          <circle cx="16" cy="50" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "mirror":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="24" rx="13" ry="15" />
          <path d="M32 39 V50" />
          <path d="M24 52 H40" />
          <path d="M24 19 C24 25 27 28 32 28 C37 28 40 25 40 19" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx="32" cy="24" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "constellation":
      return (
        <g stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18 L32 14 L44 26" />
          <path d="M44 26 L36 40 L28 48" />
          <path d="M32 14 L36 40" strokeDasharray="3 3" />
          <circle cx="14" cy="18" r="2" fill={ACCENT} stroke="none" />
          <circle cx="32" cy="14" r="2" fill={ACCENT} stroke="none" />
          <circle cx="44" cy="26" r="2" fill={ACCENT} stroke="none" />
          <circle cx="36" cy="40" r="2" fill={ACCENT} stroke="none" />
          <circle cx="28" cy="48" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "scroll":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18 H42 C44 18 46 20 46 22 V46 C46 48 44 50 42 50 H22 C20 50 18 48 18 46 V22 C18 20 20 18 22 18 Z" />
          <path d="M24 26 H40 M24 32 H36 M24 38 H32" strokeWidth={1.5} />
          <path d="M22 22 C20 22 18 24 18 26" strokeWidth={1.5} />
        </g>
      );
    case "lens":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="28" cy="28" r="11" />
          <path d="M36 36 L46 46" />
          <circle cx="28" cy="28" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "shield":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 14 L48 22 V34 C48 42 41 49 32 52 C23 49 16 42 16 34 V22 Z" />
          <path d="M32 22 V40" strokeWidth={1.5} />
          <path d="M26 32 H38" strokeWidth={1.5} />
        </g>
      );
    case "thread":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="20" rx="12" ry="5" />
          <path d="M20 20 V44" />
          <path d="M44 20 V44" />
          <ellipse cx="32" cy="44" rx="12" ry="5" />
          <path d="M26 28 C32 30 38 28 38 32 C38 36 32 38 26 36" strokeWidth={1.5} />
        </g>
      );
    case "prism":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 16 L48 48 H16 Z" />
          <path d="M32 16 V48" strokeWidth={1.5} strokeDasharray="3 3" />
          <path d="M22 36 H42" strokeWidth={1.5} />
          <circle cx="44" cy="18" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "quill":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M42 16 C36 22 30 30 26 38 L20 48 L30 42 C38 36 44 28 48 20 Z" />
          <path d="M20 48 L14 52" strokeWidth={1.5} />
          <circle cx="42" cy="18" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "anchor":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="20" r="4" />
          <path d="M32 24 V44" />
          <path d="M20 40 C20 48 44 48 44 40" />
          <path d="M18 36 H46" />
          <path d="M26 44 L32 50 L38 44" strokeWidth={1.5} />
        </g>
      );
    case "pulse":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 32 H20 L24 22 L30 42 L36 26 L40 32 H56" />
          <circle cx="8" cy="32" r="2" fill={ACCENT} stroke="none" />
          <circle cx="56" cy="32" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "beacon":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 48 V28" />
          <path d="M24 48 H40" />
          <path d="M32 12 L44 28 H20 Z" />
          <path d="M32 20 V24" strokeWidth={1.5} />
          <circle cx="32" cy="16" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "hourglass":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 14 H46 L32 32 Z" />
          <path d="M18 50 H46 L32 32 Z" />
          <path d="M28 20 H36 M28 44 H36" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "canyon":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 50 L20 18 L28 34 L36 14 L44 30 L56 50 Z" />
          <path d="M26 50 V38 M38 50 V42" strokeWidth={1.5} />
          <circle cx="36" cy="14" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "harbor":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 40 H56" />
          <path d="M14 40 V28 H24 V40" />
          <path d="M40 40 V24 H50 V40" />
          <path d="M30 40 C30 34 34 30 40 30" strokeWidth={1.5} />
          <path d="M10 44 C18 48 46 48 54 44" strokeWidth={1.5} />
        </g>
      );
    case "knot":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 24 C20 16 28 14 32 20 C36 26 44 24 44 32 C44 40 36 42 32 36 C28 30 20 32 20 40" />
          <path d="M32 20 V36" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx="32" cy="28" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "wing":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 36 C22 30 14 32 12 40 C20 38 28 38 32 44 Z" />
          <path d="M32 36 C42 30 50 32 52 40 C44 38 36 38 32 44 Z" />
          <path d="M32 44 V20" />
          <circle cx="32" cy="18" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "crater":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="32" cy="36" rx="20" ry="8" />
          <path d="M18 36 C22 28 42 28 46 36" />
          <path d="M24 22 L28 30 M40 22 L36 30" strokeWidth={1.5} />
          <circle cx="32" cy="34" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "mosaic":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="16" width="12" height="12" />
          <rect x="30" y="16" width="12" height="12" />
          <rect x="44" y="16" width="8" height="12" />
          <rect x="16" y="30" width="12" height="12" />
          <rect x="30" y="30" width="12" height="12" />
          <rect x="44" y="30" width="8" height="12" />
          <circle cx="22" cy="22" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "sundial":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 46 C32 38 48 46 48 46" />
          <path d="M32 46 V24" />
          <path d="M32 24 L40 32" strokeWidth={1.5} />
          <circle cx="32" cy="24" r="3" />
          <path d="M24 18 H40" strokeWidth={1.5} />
        </g>
      );
    case "ledger":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 14 H46 V50 H18 Z" />
          <path d="M24 22 H40 M24 30 H36 M24 38 H32" strokeWidth={1.5} />
          <path d="M42 38 H46" strokeWidth={1.5} />
          <circle cx="44" cy="38" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "vault":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="22" width="32" height="28" rx="3" />
          <circle cx="32" cy="36" r="6" />
          <path d="M32 36 V40" strokeWidth={1.5} />
          <path d="M24 22 V18 H40 V22" />
        </g>
      );
    case "circuit":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="20" width="14" height="10" rx="2" />
          <rect x="36" y="34" width="14" height="10" rx="2" />
          <path d="M28 25 H36 V39 H36" />
          <path d="M14 39 H10 V45 H54 V39 H50" strokeWidth={1.5} />
          <circle cx="10" cy="45" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "lantern":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 12 V18" />
          <path d="M24 18 H40 V34 C40 40 36 44 32 44 C28 44 24 40 24 34 Z" />
          <path d="M28 26 H36" strokeWidth={1.5} />
          <circle cx="32" cy="30" r="3" fill={ACCENT} stroke="none" opacity={0.35} />
          <path d="M26 48 H38" />
        </g>
      );
    case "helm":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="18" />
          <path d="M32 14 V50" />
          <path d="M14 32 H50" strokeWidth={1.5} />
          <path d="M32 32 L44 24" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "cascade":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 12 V22" />
          <path d="M20 22 H44 L32 34 Z" />
          <path d="M24 34 H40 L32 46 Z" />
          <path d="M28 46 H36 L32 54 Z" />
          <circle cx="32" cy="12" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "keystone":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 14 L48 42 H16 Z" />
          <path d="M10 46 H54" />
          <path d="M32 22 V34" strokeWidth={1.5} />
          <circle cx="32" cy="30" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "chisel":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 50 L46 18" />
          <path d="M14 54 L22 46" />
          <path d="M40 14 L50 10 L46 20 Z" />
          <circle cx="46" cy="16" r="1.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "spire":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 8 L44 50 H20 Z" />
          <path d="M24 50 H40" />
          <path d="M28 34 H36" strokeWidth={1.5} />
          <path d="M30 22 H34" strokeWidth={1.5} />
          <circle cx="32" cy="8" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "vector":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 46 L48 22" />
          <path d="M38 16 L48 22 L42 30" />
          <circle cx="12" cy="46" r="2.5" fill={ACCENT} stroke="none" />
        </g>
      );
    case "ember":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 20 C38 28 40 34 36 40 C32 46 28 46 24 40 C20 34 22 28 32 20 Z" />
          <circle cx="32" cy="36" r="5" fill={ACCENT} stroke="none" opacity={0.35} />
          <path d="M28 14 C30 18 32 18 36 14" strokeWidth={1.5} />
        </g>
      );
    case "loom":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14 V50 M28 14 V50 M36 14 V50 M44 14 V50" strokeWidth={1.5} />
          <path d="M14 28 H50" />
          <path d="M16 36 H48" strokeWidth={1.5} />
          <rect x="22" y="26" width="20" height="6" rx="1" />
        </g>
      );
    case "echo":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 32 C20 24 26 18 32 18 C38 18 44 24 44 32" />
          <path d="M14 32 C14 20 22 12 32 12 C42 12 50 20 50 32" strokeWidth={1.5} />
          <path d="M26 32 C26 28 29 25 32 25 C35 25 38 28 38 32" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="2" fill={ACCENT} stroke="none" />
        </g>
      );
    case "sonar":
      return (
        <g stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="4" fill={ACCENT} stroke="none" />
          <circle cx="32" cy="32" r="10" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="18" strokeWidth={1.5} />
          <circle cx="32" cy="32" r="26" strokeWidth={1.5} opacity={0.6} />
          <path d="M32 32 L46 20" strokeWidth={1.5} />
        </g>
      );
    default:
      return null;
  }
}

export function Sigil({ token, className }: { token: TokenId; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g transform={SIGIL_NUDGE[token]}>
        {renderToken(token, STROKE)}
      </g>
    </svg>
  );
}

export function resolveToken(era: Pick<Era, "token" | "name">): TokenId {
  if (era.token && TOKEN_IDS.includes(era.token)) {
    return era.token;
  }
  return pickTokenForName(era.name);
}