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
  yellow: string;
  cyan: string;
  deep: string;
  pink: string;
  sky: string;
};

type Kind = "circle" | "square" | "diamond" | "plus";

type Body = {
  kind: Kind;
  color: keyof Omit<Theme, "foreground">;
  x: number;
  y: number;
  z: number;
  size: number;
  spin: number;
  phase: number;
};

const BODIES: Body[] = [
  { kind: "circle", color: "yellow", x: 0.18, y: 0.22, z: 0.55, size: 18, spin: 0.12, phase: 0.2 },
  { kind: "square", color: "deep", x: 0.82, y: 0.2, z: 0.9, size: 16, spin: -0.08, phase: 1.1 },
  { kind: "diamond", color: "pink", x: 0.2, y: 0.72, z: 0.7, size: 14, spin: 0.18, phase: 2.4 },
  { kind: "plus", color: "cyan", x: 0.84, y: 0.68, z: 0.45, size: 20, spin: -0.14, phase: 0.7 },
  { kind: "square", color: "sky", x: 0.16, y: 0.46, z: 1.1, size: 10, spin: 0.22, phase: 1.8 },
  { kind: "circle", color: "deep", x: 0.88, y: 0.42, z: 0.35, size: 12, spin: -0.1, phase: 3.1 },
  { kind: "diamond", color: "yellow", x: 0.76, y: 0.84, z: 0.8, size: 11, spin: 0.16, phase: 2.0 },
];

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    foreground: v("--foreground") || "#f0f0f0",
    yellow: v("--bauhaus-yellow") || "#f0c020",
    cyan: v("--bauhaus-cyan") || "#22d3ee",
    deep: v("--bauhaus-deep") || "#1040c0",
    pink: v("--bauhaus-pink") || "#f9a8d4",
    sky: v("--bauhaus-sky") || "#38bdf8",
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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

function drawBody(
  ctx: CanvasRenderingContext2D,
  kind: Kind,
  x: number,
  y: number,
  size: number,
  rot: number,
  fill: string,
  stroke: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  const s = size;
  if (kind === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (kind === "square") {
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeRect(-s / 2, -s / 2, s, s);
  } else if (kind === "diamond") {
    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(s / 2, 0);
    ctx.lineTo(0, s / 2);
    ctx.lineTo(-s / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-s / 2, 0);
    ctx.lineTo(s / 2, 0);
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(0, s / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const pointer = { x: 0.5, y: 0.42, active: false };
    const mouse = { x: 0.5, y: 0.42 };
    const bursts: { x: number; y: number; born: number }[] = [];
    let theme = readTheme();
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
      const idleY = 0.42 + Math.cos(t * 0.17) * 0.08;
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
      const radius = Math.min(width, height) * 0.28;
      const force = 26;
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
            const waveR = 24 + age * 280;
            const crest = Math.max(0, 1 - Math.abs(bd - waveR) / 90);
            const core = Math.exp(-age * 1.6) * Math.exp(-(bd * bd) / (160 * 160));
            const push = crest * crest * 14 + core * 18;
            px += (bdx / bd) * push;
            py += (bdy / bd) * push;
            burstGlow = Math.max(burstGlow, crest * 0.35 * Math.max(0, 1 - age / 1.8));
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

      const projected = BODIES.map((body, i) => {
        const bob = Math.sin(t * 0.55 + body.phase) * 10;
        const sway = Math.cos(t * 0.4 + body.phase) * 8;
        const parallax = 18 + body.z * 22;
        let x =
          body.x * width +
          sway +
          (mouse.x - 0.5) * parallax * (pointer.active ? 1 : 0.45);
        let y =
          body.y * height +
          bob +
          (mouse.y - 0.42) * parallax * 0.7 * (pointer.active ? 1 : 0.45);

        for (const burst of bursts) {
          const age = (now - burst.born) / 1000;
          const bx = burst.x * width;
          const by = burst.y * height;
          const bdx = x - bx;
          const bdy = y - by;
          const bd = Math.hypot(bdx, bdy) || 0.001;
          const kick = Math.exp(-age * 1.5) * Math.exp(-(bd * bd) / (280 * 280)) * 18;
          x += (bdx / bd) * kick;
          y += (bdy / bd) * kick;
        }

        const scale = 0.72 + (1.15 - body.z) * 0.28;
        const rot = t * body.spin + i * 0.4;
        return { body, x, y, scale, rot };
      });

      for (const item of projected) {
        const color = theme[item.body.color];
        drawBody(
          ctx,
          item.body.kind,
          item.x,
          item.y,
          item.body.size * item.scale,
          item.rot,
          hexAlpha(color, 0.14),
          hexAlpha(color, 0.85),
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
  }, []);

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
