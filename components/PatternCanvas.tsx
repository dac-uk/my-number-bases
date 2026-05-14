"use client";

import { useEffect, useRef } from "react";

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
  size?: number;
}

export function PatternCanvas({ kind, base, param = 7, size = 520 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    if (kind === "modular") drawModular(ctx, size, base);
    else if (kind === "multiplication-circle") drawMultCircle(ctx, size, base, param);
    else if (kind === "ulam") drawUlam(ctx, size, base);
    else if (kind === "binary-pixels") drawBinaryPixels(ctx, size, base);
    else if (kind === "pascal-mod") drawPascal(ctx, size, base);
  }, [kind, base, param, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className="rounded-2xl border border-white/5 bg-ink-900/60"
    />
  );
}

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

function drawUlam(ctx: CanvasRenderingContext2D, size: number, base: number) {
  // Highlight numbers whose representation in `base` is a palindrome.
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
    const s = toBase(n, base);
    const isPal = s === s.split("").reverse().join("");
    if (isPal) {
      ctx.fillStyle = colorFromT((n % 200) / 200);
      ctx.fillRect(x * cw, y * cw, cw, cw);
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(x * cw, y * cw, cw, cw);
    }
    // spiral step
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
    if (x < 0 || y < 0 || x >= cells || y >= cells) break;
  }
}

function drawBinaryPixels(ctx: CanvasRenderingContext2D, size: number, base: number) {
  // Each row is the digit sequence of n in `base`, n increasing downward.
  const rows = 80;
  const cols = 80;
  const cw = size / cols;
  const ch = size / rows;
  for (let r = 0; r < rows; r += 1) {
    const n = r + 1;
    const digits = toBase(n, base).split("").reverse();
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

function toBase(n: number, base: number): string {
  if (base < 2 || base > 36) base = 10;
  return n.toString(base).toUpperCase();
}

function colorFromT(t: number): string {
  // cyan → violet → magenta → gold
  const hue = 180 + t * 220;
  return `hsla(${hue}, 80%, 62%, 0.85)`;
}
