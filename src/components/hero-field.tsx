"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Theme = {
  foreground: string;
  background: string;
  ink: string;
  yellow: string;
  cyan: string;
  deep: string;
  pink: string;
  sky: string;
};

type GlyphBody = {
  glyph: string;
  color: keyof Omit<Theme, "foreground" | "background" | "ink">;
  /** Radians on the hero ellipse — left arc ≈ 2.1–3.8, right arc ≈ -0.75–0.55. */
  angle: number;
  /** Per-glyph radius multiplier for depth variation. */
  radius: number;
  z: number;
  size: number;
  spin: number;
  phase: number;
};

const ELLIPSE_CY = 0.43;
const SHARE_ELLIPSE_CY = 0.54;

/** Evenly spaced on left / right arcs — pairs read top-to-bottom on each flank. */
const LEFT_ARC_ANGLES = [3.95, 3.48, 3.02, 2.55, 2.08, 1.72] as const;
const RIGHT_ARC_ANGLES = [-0.92, -0.46, 0, 0.46, 0.92, 1.28] as const;

const SHARE_LEFT_ARC_ANGLES = [3.88, 3.28, 2.68, 2.02] as const;
const SHARE_RIGHT_ARC_ANGLES = [-0.86, -0.3, 0.26, 0.82] as const;

/** Twelve tokens on a soft ellipse framing the hero copy. */
const GLYPHS: GlyphBody[] = [
  { glyph: "< />", color: "yellow", angle: LEFT_ARC_ANGLES[0], radius: 1, z: 0.55, size: 13, spin: 0.05, phase: 0.2 },
  { glyph: "{ }", color: "deep", angle: RIGHT_ARC_ANGLES[0], radius: 1, z: 0.85, size: 14, spin: -0.04, phase: 1.0 },
  { glyph: "[ ]", color: "sky", angle: LEFT_ARC_ANGLES[1], radius: 1, z: 0.7, size: 13, spin: 0.06, phase: 1.6 },
  { glyph: "=>", color: "cyan", angle: RIGHT_ARC_ANGLES[1], radius: 1, z: 0.5, size: 13, spin: -0.05, phase: 2.2 },
  { glyph: "&&", color: "pink", angle: LEFT_ARC_ANGLES[2], radius: 1, z: 0.9, size: 12, spin: 0.07, phase: 0.8 },
  { glyph: "?.", color: "deep", angle: RIGHT_ARC_ANGLES[2], radius: 1, z: 0.65, size: 12, spin: -0.06, phase: 2.8 },
  { glyph: "#", color: "yellow", angle: LEFT_ARC_ANGLES[3], radius: 1, z: 0.6, size: 13, spin: 0.04, phase: 3.1 },
  { glyph: "//", color: "cyan", angle: RIGHT_ARC_ANGLES[3], radius: 1, z: 0.75, size: 12, spin: -0.05, phase: 1.3 },
  { glyph: ";", color: "sky", angle: LEFT_ARC_ANGLES[4], radius: 1, z: 0.45, size: 15, spin: 0.08, phase: 2.5 },
  { glyph: "...", color: "pink", angle: RIGHT_ARC_ANGLES[4], radius: 1, z: 0.8, size: 13, spin: -0.03, phase: 0.5 },
  { glyph: "??", color: "yellow", angle: LEFT_ARC_ANGLES[5], radius: 1, z: 0.7, size: 12, spin: 0.05, phase: 3.6 },
  { glyph: "**", color: "deep", angle: RIGHT_ARC_ANGLES[5], radius: 1, z: 0.55, size: 12, spin: -0.06, phase: 1.9 },
];

const SHARE_GLYPHS: GlyphBody[] = [
  { glyph: "< />", color: "yellow", angle: SHARE_LEFT_ARC_ANGLES[0], radius: 1, z: 0.55, size: 12, spin: 0.05, phase: 0.2 },
  { glyph: "{ }", color: "deep", angle: SHARE_RIGHT_ARC_ANGLES[0], radius: 1, z: 0.85, size: 13, spin: -0.04, phase: 1.0 },
  { glyph: "[ ]", color: "sky", angle: SHARE_LEFT_ARC_ANGLES[1], radius: 1, z: 0.7, size: 12, spin: 0.06, phase: 1.6 },
  { glyph: "=>", color: "cyan", angle: SHARE_RIGHT_ARC_ANGLES[1], radius: 1, z: 0.5, size: 12, spin: -0.05, phase: 2.2 },
  { glyph: "&&", color: "pink", angle: SHARE_LEFT_ARC_ANGLES[2], radius: 1, z: 0.9, size: 11, spin: 0.07, phase: 0.8 },
  { glyph: "?.", color: "deep", angle: SHARE_RIGHT_ARC_ANGLES[2], radius: 1, z: 0.65, size: 11, spin: -0.06, phase: 2.8 },
  { glyph: "#", color: "yellow", angle: SHARE_LEFT_ARC_ANGLES[3], radius: 1, z: 0.6, size: 12, spin: 0.04, phase: 3.1 },
  { glyph: "//", color: "cyan", angle: SHARE_RIGHT_ARC_ANGLES[3], radius: 1, z: 0.75, size: 11, spin: -0.05, phase: 1.3 },
];

export type HeroFieldVariant = "home" | "share";

function glyphsForVariant(variant: HeroFieldVariant) {
  return variant === "share" ? SHARE_GLYPHS : GLYPHS;
}

if (process.env.NODE_ENV !== "production") {
  const glyphs = GLYPHS.map((g) => g.glyph);
  if (new Set(glyphs).size !== glyphs.length) {
    throw new Error("Hero GLYPHS must contain 12 unique symbols.");
  }
}

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    foreground: v("--foreground") || "#f0f0f0",
    background: v("--background") || "#0a0a0a",
    ink: v("--bauhaus-ink") || "#121212",
    yellow: v("--bauhaus-yellow") || "#f0c020",
    cyan: v("--bauhaus-cyan") || "#22d3ee",
    deep: v("--bauhaus-deep") || "#1040c0",
    pink: v("--bauhaus-pink") || "#f9a8d4",
    sky: v("--bauhaus-sky") || "#38bdf8",
  };
}

function readMonoFont() {
  const css = getComputedStyle(document.documentElement);
  const family = css.getPropertyValue("--font-mono").trim();
  return family || '"JetBrains Mono", ui-monospace, monospace';
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type EllipseFrame = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

/** Content-aware ellipse — consistent pixel orbit on large screens, tighter on small. */
function homeEllipseFrame(viewportWidth: number, viewportHeight: number): EllipseFrame {
  const w = viewportWidth;
  const h = viewportHeight;
  const cy = ELLIPSE_CY;

  const contentHalfW = Math.min(420, w * 0.34);
  const contentHeight = Math.min(500, h * 0.54);

  if (w < 640) {
    return {
      cx: 0.5,
      cy,
      rx: Math.min(0.44, (contentHalfW + 28) / w),
      ry: Math.min(0.42, (contentHeight * 0.56 + 20) / h),
    };
  }

  if (w < 1024) {
    return {
      cx: 0.5,
      cy,
      rx: Math.min(0.36, (contentHalfW + 40) / w),
      ry: Math.min(0.36, (contentHeight * 0.58 + 28) / h),
    };
  }

  const padX = 68 + Math.min(28, (w - 1280) / 70);
  const padY = 58 + Math.min(24, (h - 880) / 55);

  return {
    cx: 0.5,
    cy,
    rx: (contentHalfW + padX) / w,
    ry: Math.min(0.38, (contentHeight * 0.64 + padY) / h),
  };
}

/** Compact ellipse around share-page title + handle. */
function shareEllipseFrame(viewportWidth: number, viewportHeight: number): EllipseFrame {
  const w = viewportWidth;
  const h = Math.max(viewportHeight, 220);
  const cy = SHARE_ELLIPSE_CY;
  const titleHalfW = Math.min(360, w * 0.4);
  const blockH = Math.min(150, h * 0.7);

  if (w < 640) {
    return {
      cx: 0.5,
      cy,
      rx: Math.min(0.5, (titleHalfW + 22) / w),
      ry: Math.min(0.44, (blockH * 0.6 + 16) / h),
    };
  }

  const padX = 40 + Math.min(22, (w - 1024) / 90);
  const padY = 20 + Math.min(12, (h - 280) / 35);

  return {
    cx: 0.5,
    cy,
    rx: Math.min(0.44, (titleHalfW + padX) / w),
    ry: Math.min(0.42, (blockH * 0.66 + padY) / h),
  };
}

function ellipseFrame(
  viewportWidth: number,
  viewportHeight: number,
  variant: HeroFieldVariant,
): EllipseFrame {
  return variant === "share"
    ? shareEllipseFrame(viewportWidth, viewportHeight)
    : homeEllipseFrame(viewportWidth, viewportHeight);
}

function glyphEllipsePosition(
  viewportWidth: number,
  viewportHeight: number,
  body: GlyphBody,
  variant: HeroFieldVariant,
) {
  const { cx, cy, rx, ry } = ellipseFrame(viewportWidth, viewportHeight, variant);
  const depth = 0.96 + body.z * 0.06;
  const x = cx + Math.cos(body.angle) * rx * body.radius * depth;
  const y = cy + Math.sin(body.angle) * ry * body.radius * depth;
  return { x: x * viewportWidth, y: y * viewportHeight, cy };
}

function hexAlpha(hex: string, alpha: number) {
  const n = hex.replace("#", "").trim();
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n.slice(0, 6);
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(240, 240, 240, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: string,
  x: number,
  y: number,
  fontSize: number,
  rot: number,
  theme: Theme,
  fill: string,
  monoFont: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  const weight = 700;
  ctx.font = `${weight} ${fontSize}px ${monoFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.globalAlpha = 0.42;
  ctx.shadowColor = hexAlpha(theme.foreground, 0.55);
  ctx.shadowBlur = fontSize * 0.35;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = fill;
  ctx.fillText(glyph, 0, fontSize * 0.06);

  ctx.shadowBlur = fontSize * 0.55;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = hexAlpha(fill, 0.35);
  ctx.globalAlpha = 0.58;
  ctx.fillText(glyph, 0, fontSize * 0.06);

  ctx.restore();
}

export function HeroField({ variant = "home" }: { variant?: HeroFieldVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const focusCy = variant === "share" ? SHARE_ELLIPSE_CY : ELLIPSE_CY;
    const glyphs = glyphsForVariant(variant);
    const motionScale = variant === "share" ? 0.82 : 1;
    const glyphScale = variant === "share" ? 0.9 : 1;

    const pointer = { x: 0.5, y: focusCy, active: false };
    const mouse = { x: 0.5, y: focusCy };
    const bursts: { x: number; y: number; born: number }[] = [];
    let theme = readTheme();
    let monoFont = readMonoFont();
    void document.fonts?.ready.then(() => {
      monoFont = readMonoFont();
    });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const start = performance.now();
    let running = true;

    const resize = () => {
      const stage = canvas.closest("[data-hero-stage]");
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointer = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      const inside = x >= -0.05 && x <= 1.05 && y >= -0.08 && y <= 1.08;
      pointer.active = inside;
      if (inside) {
        pointer.x = x;
        pointer.y = y;
      }
    };

    const onLeave = () => {
      pointer.active = false;
    };

    const onClick = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      pointer.active = true;
      pointer.x = x;
      pointer.y = y;
      bursts.push({ x, y, born: performance.now() });
      if (bursts.length > 5) bursts.shift();
    };

    const draw = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;

      const t = (now - start) / 1000;
      const idleX = 0.5 + Math.sin(t * 0.22) * 0.12;
      const idleY = focusCy + Math.cos(t * 0.17) * 0.08;
      const targetX = pointer.active ? pointer.x : idleX;
      const targetY = pointer.active ? pointer.y : idleY;
      const follow = pointer.active ? 0.085 : 0.035;
      mouse.x = lerp(mouse.x, targetX, follow);
      mouse.y = lerp(mouse.y, targetY, follow);

      while (bursts.length && now - bursts[0]!.born > 2200) bursts.shift();

      const mx = mouse.x * width;
      const my = mouse.y * height;

      ctx.clearRect(0, 0, width, height);

      const spacing = 22;
      const radius = Math.min(width, height) * 0.26;
      const force = 17;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const gx = col * spacing;
          const gy = row * spacing;
          const dx = gx - mx;
          const dy = gy - my;
          const dist = Math.hypot(dx, dy) || 0.001;
          const fall = Math.max(0, 1 - dist / radius);
          const eased = fall * fall * (3 - 2 * fall);
          let px = gx + (dx / dist) * force * eased;
          let py = gy + (dy / dist) * force * eased;
          let burstGlow = 0;

          for (const burst of bursts) {
            const age = (now - burst.born) / 1000;
            const bx = burst.x * width;
            const by = burst.y * height;
            const bdx = gx - bx;
            const bdy = gy - by;
            const bd = Math.hypot(bdx, bdy) || 0.001;
            const waveR = 18 + age * 190;
            const crest = Math.max(0, 1 - Math.abs(bd - waveR) / 72);
            const core = Math.exp(-age * 2.1) * Math.exp(-(bd * bd) / (210 * 210));
            const push = crest * crest * 7 + core * 8;
            px += (bdx / bd) * push;
            py += (bdy / bd) * push;
            burstGlow = Math.max(burstGlow, crest * 0.28 * Math.max(0, 1 - age / 2));
          }

          const accent = ((gx / spacing + gy / spacing) | 0) % 7 === 0;
          const size = 1 + eased * 1.6 + burstGlow * 1.8;
          ctx.globalAlpha = 0.28 + eased * 0.64 + burstGlow * 0.45;
          ctx.fillStyle = burstGlow > 0.25
            ? hexAlpha(theme.yellow, 0.7 + burstGlow * 0.3)
            : accent
              ? hexAlpha(eased > 0.35 ? theme.yellow : theme.cyan, 0.62 + eased * 0.38)
              : hexAlpha(theme.foreground, 0.6 + eased * 0.4);
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;

      const projected = glyphs.map((body) => {
        const bob = Math.sin(t * 0.55 + body.phase) * 7 * motionScale;
        const sway = Math.cos(t * 0.4 + body.phase) * 5 * motionScale;
        const parallax = (14 + body.z * 16) * motionScale;
        const base = glyphEllipsePosition(width, height, body, variant);
        let x =
          base.x +
          sway +
          (mouse.x - 0.5) * parallax * (pointer.active ? 0.9 : 0.4);
        let y =
          base.y +
          bob +
          (mouse.y - base.cy) * parallax * 0.65 * (pointer.active ? 0.9 : 0.4);

        const gdx = x - mx;
        const gdy = y - my;
        const gd = Math.hypot(gdx, gdy) || 0.001;
        const glyphRadius = Math.min(width, height) * 0.22;
        const gFall = smoothstep(glyphRadius, 0, gd);
        const push = 13 * gFall * (pointer.active ? 0.82 : 0.52);
        x += (gdx / gd) * push;
        y += (gdy / gd) * push;

        for (const burst of bursts) {
          const age = (now - burst.born) / 1000;
          const bx = burst.x * width;
          const by = burst.y * height;
          const bdx = x - bx;
          const bdy = y - by;
          const bd = Math.hypot(bdx, bdy) || 0.001;
          const waveR = 16 + age * 175;
          const crest = Math.max(0, 1 - Math.abs(bd - waveR) / 68);
          const core = Math.exp(-age * 2.3) * Math.exp(-(bd * bd) / (340 * 340));
          const kick = crest * crest * 6 + core * 10;
          x += (bdx / bd) * kick;
          y += (bdy / bd) * kick;
        }

        const scale = 0.82 + (1.15 - body.z) * 0.22;
        const tangent = body.angle + Math.PI / 2;
        const rot =
          Math.sin(t * 0.5 + body.phase) * 0.08 +
          t * body.spin * 0.28 +
          (mouse.x - 0.5) * 0.05 +
          Math.sin(tangent) * 0.12;
        return { body, x, y, scale, rot };
      });

      for (const item of projected) {
        const fill = theme[item.body.color];
        const uiScale =
          Math.min(1.28, Math.max(0.95, width / 880)) * glyphScale;
        drawGlyph(
          ctx,
          item.body.glyph,
          item.x,
          item.y,
          item.body.size * item.scale * uiScale,
          item.rot,
          theme,
          fill,
          monoFont,
        );
      }
    };

    resize();
    raf = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    const stage = canvas.closest("[data-hero-stage]");
    if (stage) observer.observe(stage);

    const themeWatch = new MutationObserver(() => {
      theme = readTheme();
      monoFont = readMonoFont();
    });
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      themeWatch.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full z-0 motion-reduce:hidden [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
    />
  );
}

const TILT_SCALE = 1.1;

export function HeroTilt({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const current = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.07);
      current.current.y = lerp(current.current.y, target.current.y, 0.07);
      const { x, y } = current.current;
      el.style.transform = `perspective(1400px) rotateX(${(-y * 3.2).toFixed(3)}deg) rotateY(${(x * 4.2).toFixed(3)}deg) translate3d(${(x * 6).toFixed(2)}px, ${(y * 4).toFixed(2)}px, 0) scale(${TILT_SCALE})`;
      frame.current = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      target.current.x = Math.max(-1, Math.min(1, nx));
      target.current.y = Math.max(-1, Math.min(1, ny));
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    frame.current = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 will-change-transform", className)}
      style={
        {
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
