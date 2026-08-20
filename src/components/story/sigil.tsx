"use client";

import { useId } from "react";
import type { Era } from "@/lib/devstory/story";
import {
  pickTokenForName,
  TOKEN_IDS,
  type TokenId,
} from "@/lib/devstory/tokens";

const ACCENT = "#22d3ee";

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
    default:
      return null;
  }
}

export function Sigil({ token, className }: { token: TokenId; className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {renderToken(token, `url(#${id})`)}
    </svg>
  );
}

export function resolveToken(era: Pick<Era, "token" | "name">): TokenId {
  if (era.token && TOKEN_IDS.includes(era.token)) {
    return era.token;
  }
  return pickTokenForName(era.name);
}