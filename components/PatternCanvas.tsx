"use client";

import { useEffect, useRef, useState } from "react";

export type PatternKind =
  | "modular"
  | "multiplication-circle"
  | "ulam"
  | "binary-pixels"
  | "pascal-mod";

interface Props {
  kind: PatternKind;
  base: number;
  param?: number;
  maxSize?: number;
}

interface HitInfo {
  cellX: number;
  cellY: number;
  cellW: number;
  cellH: number;
  primary: string;
  secondary?: string;
  tint?: string;
}

interface Hover {
  px: number;
  py: number;
  info: HitInfo;
}

export function PatternCanvas({ kind, base, param = 7, maxSize = 560 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spiralMapRef = useRef<Map<string, number>>(new Map());
  // `size` is the canvas's rendered CSS width — updated by the ResizeObserver.
  const [size, setSize] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);

  // Single effect: redraw whenever the kind, base, param or rendered size
  // changes; the ResizeObserver pokes size whenever the canvas reflows.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const redraw = () => {
      const w = canvas.clientWidth;
      if (w <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, w);

      spiralMapRef.current = new Map();
      if (kind === "modular") drawModular(ctx, w, base);
      else if (kind === "multiplication-circle") drawMultCircle(ctx, w, base, param);
      else if (kind === "ulam") drawUlam(ctx, w, base, spiralMapRef.current);
      else if (kind === "binary-pixels") drawBinaryPixels(ctx, w, base);
      else if (kind === "pascal-mod") drawPascal(ctx, w, base);

      setSize(w);
    };

    redraw();
    const ro = new ResizeObserver(redraw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [kind, base, param]);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const c = canvasRef.current;
    if (!c || size <= 0) return;
    const rect = c.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx < 0 || my < 0 || mx >= size || my >= size) {
      setHover(null);
      return;
    }
    const info = hitTest(kind, base, param, size, mx, my, spiralMapRef.current);
    if (info) setHover({ px: mx, py: my, info });
    else setHover(null);
  };

  const onLeave = () => setHover(null);

  // Position the tooltip near the pointer but flip if near right/bottom edges.
  const TOOLTIP_W = 220;
  const TOOLTIP_H = 64;
  const tipLeft =
    hover && hover.px + 16 + TOOLTIP_W > size ? hover.px - 16 - TOOLTIP_W : (hover?.px ?? 0) + 16;
  const tipTop =
    hover && hover.py + 16 + TOOLTIP_H > size ? hover.py - 16 - TOOLTIP_H : (hover?.py ?? 0) + 16;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full min-w-0 touch-none"
      style={{ maxWidth: maxSize }}
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full rounded-2xl border border-white/5 bg-ink-900/60"
      />
      {hover && (
        <>
          <div
            className="pointer-events-none absolute rounded-md border border-neon-cyan/80"
            style={{
              left: hover.info.cellX,
              top: hover.info.cellY,
              width: hover.info.cellW,
              height: hover.info.cellH,
              boxShadow:
                "0 0 0 1px rgba(125,249,255,0.25), 0 0 18px rgba(125,249,255,0.45)",
            }}
          />
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-ink-950/90 px-3 py-2 font-mono text-xs leading-snug text-white/90 backdrop-blur-md"
            style={{ left: tipLeft, top: tipTop, maxWidth: TOOLTIP_W }}
          >
            <span className="block text-neon-cyan">{hover.info.primary}</span>
            {hover.info.secondary && (
              <span className="mt-0.5 block text-white/55">{hover.info.secondary}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Hit testing — mirrors the drawing math of each kind.
// ============================================================================

function hitTest(
  kind: PatternKind,
  base: number,
  param: number,
  size: number,
  mx: number,
  my: number,
  spiralMap: Map<string, number>,
): HitInfo | null {
  if (kind === "modular") {
    const cells = Math.min(60, Math.max(8, base * 2));
    const cw = size / cells;
    const cx = Math.floor(mx / cw);
    const cy = Math.floor(my / cw);
    if (cx < 0 || cy < 0 || cx >= cells || cy >= cells) return null;
    const product = cx * cy;
    const value = product % base;
    return {
      cellX: cx * cw,
      cellY: cy * cw,
      cellW: cw,
      cellH: cw,
      primary: `(${cx} × ${cy}) mod ${base} = ${value}`,
      secondary: `${cx} × ${cy} = ${product.toLocaleString("en")}`,
    };
  }

  if (kind === "binary-pixels") {
    const rows = 80;
    const cols = 80;
    const cw = size / cols;
    const ch = size / rows;
    const c = Math.floor(mx / cw);
    const r = Math.floor(my / ch);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    const n = r + 1;
    const repr = n.toString(base).toUpperCase();
    const reversed = repr.split("").reverse();
    const digit = reversed[c];
    if (!digit) return null;
    const value = parseInt(digit, 36);
    return {
      cellX: c * cw,
      cellY: r * ch,
      cellW: cw,
      cellH: ch,
      primary: `n = ${n}, digit ${digit} = ${value} × ${base}^${c}`,
      secondary: `${n} in base ${base} = ${repr}`,
    };
  }

  if (kind === "pascal-mod") {
    const rows = 64;
    const cw = size / rows;
    const r = Math.floor(my / cw);
    if (r < 0 || r >= rows) return null;
    const offset = ((rows - r - 1) * cw) / 2;
    const c = Math.floor((mx - offset) / cw);
    if (c < 0 || c > r) return null;
    const bin = binomial(r, c);
    const value = Number(bin % BigInt(base));
    return {
      cellX: offset + c * cw,
      cellY: r * cw,
      cellW: cw,
      cellH: cw,
      primary: `C(${r}, ${c}) mod ${base} = ${value}`,
      secondary: `C(${r}, ${c}) = ${formatBig(bin)}`,
    };
  }

  if (kind === "ulam") {
    const cells = 81;
    const cw = size / cells;
    const cx = Math.floor(mx / cw);
    const cy = Math.floor(my / cw);
    const n = spiralMap.get(`${cx},${cy}`);
    if (n === undefined) return null;
    const repr = n.toString(base).toUpperCase();
    const isPal = repr === repr.split("").reverse().join("");
    return {
      cellX: cx * cw,
      cellY: cy * cw,
      cellW: cw,
      cellH: cw,
      primary: `n = ${n.toLocaleString("en")}`,
      secondary: `base ${base}: ${repr}${isPal ? " · palindrome" : ""}`,
    };
  }

  if (kind === "multiplication-circle") {
    // Detect proximity to one of the `base` chord endpoints.
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;
    let bestI = -1;
    let bestD = Infinity;
    for (let i = 0; i < base; i += 1) {
      const a = (i / base) * Math.PI * 2 - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      const d = Math.hypot(mx - x, my - y);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    const tolerance = Math.min(20, size / base / 2 + 6);
    if (bestI < 0 || bestD > tolerance) return null;
    const j = (bestI * param) % base;
    const a = (bestI / base) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const dot = 14;
    return {
      cellX: x - dot / 2,
      cellY: y - dot / 2,
      cellW: dot,
      cellH: dot,
      primary: `${bestI} × ${param} mod ${base} = ${j}`,
      secondary: `point ${bestI} connects to ${j}`,
    };
  }

  return null;
}

function binomial(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let kk = k;
  if (kk > n - kk) kk = n - kk;
  let r = 1n;
  for (let i = 0; i < kk; i += 1) {
    r = (r * BigInt(n - i)) / BigInt(i + 1);
  }
  return r;
}

function formatBig(x: bigint): string {
  const s = x.toString();
  if (s.length <= 16) return Number(x).toLocaleString("en");
  return s.slice(0, 6) + "…" + s.slice(-3) + ` (${s.length} digits)`;
}

// ============================================================================
// Drawing functions (unchanged math; ulam now stores its spiral map).
// ============================================================================

function drawModular(ctx: CanvasRenderingContext2D, size: number, base: number) {
  const cells = Math.min(60, Math.max(8, base * 2));
  const cw = size / cells;
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const v = (x * y) % base;
      const t = v / Math.max(1, base - 1);
      ctx.fillStyle = colorFromT(t);
      ctx.fillRect(x * cw, y * cw, cw + 0.5, cw + 0.5);
    }
  }
}

function drawMultCircle(
  ctx: CanvasRenderingContext2D,
  size: number,
  n: number,
  factor: number,
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < n; i += 1) {
    const j = (i * factor) % n;
    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a2 = (j / n) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const hue = (i / n) * 360;
    ctx.strokeStyle = `hsla(${hue}, 70%, 65%, 0.35)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawUlam(
  ctx: CanvasRenderingContext2D,
  size: number,
  base: number,
  spiralMap: Map<string, number>,
) {
  const cells = 81;
  const cw = size / cells;
  const cx = Math.floor(cells / 2);
  const cy = Math.floor(cells / 2);
  let x = cx;
  let y = cy;
  let dx = 1;
  let dy = 0;
  let steps = 1;
  let stepInThisLeg = 0;
  let legCount = 0;
  for (let n = 1; n <= cells * cells; n += 1) {
    if (x < 0 || y < 0 || x >= cells || y >= cells) break;
    const s = n.toString(base).toUpperCase();
    const isPal = s === s.split("").reverse().join("");
    spiralMap.set(`${x},${y}`, n);
    if (isPal) {
      ctx.fillStyle = colorFromT((n % 200) / 200);
      ctx.fillRect(x * cw, y * cw, cw, cw);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(x * cw, y * cw, cw, cw);
    }
    x += dx;
    y += dy;
    stepInThisLeg += 1;
    if (stepInThisLeg === steps) {
      stepInThisLeg = 0;
      const t = dx;
      dx = -dy;
      dy = t;
      legCount += 1;
      if (legCount % 2 === 0) steps += 1;
    }
  }
}

function drawBinaryPixels(ctx: CanvasRenderingContext2D, size: number, base: number) {
  const rows = 80;
  const cols = 80;
  const cw = size / cols;
  const ch = size / rows;
  for (let r = 0; r < rows; r += 1) {
    const n = r + 1;
    const digits = n.toString(base).toUpperCase().split("").reverse();
    for (let c = 0; c < cols; c += 1) {
      const d = digits[c];
      if (!d) continue;
      const v = parseInt(d, 36);
      const t = v / Math.max(1, base - 1);
      ctx.fillStyle = colorFromT(t);
      ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);
    }
  }
}

function drawPascal(ctx: CanvasRenderingContext2D, size: number, base: number) {
  const rows = 64;
  const cw = size / rows;
  let row: number[] = [1];
  for (let r = 0; r < rows; r += 1) {
    const offset = ((rows - r - 1) * cw) / 2;
    for (let c = 0; c <= r; c += 1) {
      const v = row[c] % base;
      if (v !== 0) {
        const t = v / Math.max(1, base - 1);
        ctx.fillStyle = colorFromT(t);
        ctx.fillRect(offset + c * cw, r * cw, cw + 0.5, cw + 0.5);
      }
    }
    const next: number[] = [1];
    for (let i = 0; i < row.length - 1; i += 1) {
      next.push((row[i] + row[i + 1]) % base);
    }
    next.push(1);
    row = next;
  }
}

function colorFromT(t: number): string {
  const hue = 180 + t * 220;
  return `hsla(${hue}, 80%, 62%, 0.85)`;
}
