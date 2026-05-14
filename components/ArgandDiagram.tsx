"use client";

import { useEffect, useRef } from "react";
import { iPower, type Complex } from "@/lib/complex";

interface Props {
  // continuous power of i (so 0..4 traces a full revolution)
  k: number;
  // additional points to render (with optional labels)
  points?: { z: Complex; label?: string; tint?: string }[];
  /** Aspect ratio used by the responsive container (width / height). */
  aspect?: number;
  /** Tailwind className for the outer container (e.g. min-height utilities). */
  className?: string;
  showTrail?: boolean;
}

// Renders the Argand plane with the i^k vector and trail.
export function ArgandDiagram({
  k,
  points = [],
  aspect = 1,
  className = "",
  showTrail = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const unit = Math.min(w, h) * 0.32;

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      const step = unit / 2;
      for (let x = cx % step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = cy % step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // axes
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // axis ticks at ±1, ±2
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "11px ui-monospace, SFMono-Regular, monospace";
      [-2, -1, 1, 2].forEach((n) => {
        ctx.fillText(String(n), cx + n * unit - 4, cy + 14);
        ctx.fillText(`${n}i`, cx + 6, cy - n * unit + 4);
      });
      ctx.fillText("Re", w - 22, cy - 6);
      ctx.fillText("Im", cx + 6, 14);

      // unit circle
      ctx.beginPath();
      ctx.arc(cx, cy, unit, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(125,249,255,0.18)";
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // cardinal markers 1, i, -1, -i
      const cardinals: { c: Complex; label: string }[] = [
        { c: { re: 1, im: 0 }, label: "1" },
        { c: { re: 0, im: 1 }, label: "i" },
        { c: { re: -1, im: 0 }, label: "−1" },
        { c: { re: 0, im: -1 }, label: "−i" },
      ];
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (const { c, label } of cardinals) {
        const x = cx + c.re * unit;
        const y = cy - c.im * unit;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillText(label, x + 8, y - 8);
      }

      // extra points
      for (const p of points) {
        const x = cx + p.z.re * unit;
        const y = cy - p.z.im * unit;
        const tint = p.tint ?? "#b388ff";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = tint;
        ctx.shadowColor = tint;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.label) {
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillText(p.label, x + 10, y - 10);
        }
      }

      // i^k vector
      const z = iPower(k);
      const px = cx + z.re * unit;
      const py = cy - z.im * unit;

      // trail
      if (showTrail) {
        trailRef.current.push({ x: px, y: py });
        if (trailRef.current.length > 64) trailRef.current.shift();
        for (let i = 1; i < trailRef.current.length; i += 1) {
          const a = trailRef.current[i - 1];
          const b = trailRef.current[i];
          const alpha = i / trailRef.current.length;
          ctx.strokeStyle = `rgba(125,249,255,${alpha * 0.45})`;
          ctx.lineWidth = 2 * alpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // vector arrow
      const grad = ctx.createLinearGradient(cx, cy, px, py);
      grad.addColorStop(0, "rgba(125,249,255,0.1)");
      grad.addColorStop(1, "#7df9ff");
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // pointer dot
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#7df9ff";
      ctx.shadowColor = "#7df9ff";
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    draw();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [k, points, showTrail]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-white/5 bg-ink-900/40 ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
