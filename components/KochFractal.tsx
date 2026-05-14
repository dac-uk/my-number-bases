"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

function iterate(points: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const p1 = { x: a.x + dx / 3, y: a.y + dy / 3 };
    const p3 = { x: a.x + (2 * dx) / 3, y: a.y + (2 * dy) / 3 };
    // peak: rotate (p3 - p1) by -60° (anti-clockwise in screen coords flipped)
    const ex = p3.x - p1.x;
    const ey = p3.y - p1.y;
    const angle = -Math.PI / 3;
    const rx = ex * Math.cos(angle) - ey * Math.sin(angle);
    const ry = ex * Math.sin(angle) + ey * Math.cos(angle);
    const p2 = { x: p1.x + rx, y: p1.y + ry };
    out.push(a, p1, p2, p3);
  }
  out.push(points[points.length - 1]);
  return out;
}

function snowflake(iterations: number): Point[] {
  const size = 320;
  const cx = 200;
  const cy = 220;
  const a = { x: cx - size / 2, y: cy + size / (2 * Math.sqrt(3)) };
  const b = { x: cx + size / 2, y: cy + size / (2 * Math.sqrt(3)) };
  const c = { x: cx, y: cy - size / Math.sqrt(3) };
  let pts: Point[] = [a, b, c, a];
  for (let i = 0; i < iterations; i += 1) {
    pts = iterate(pts);
  }
  return pts;
}

export function KochFractal() {
  const [depth, setDepth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const points = useMemo(() => snowflake(depth), [depth]);
  const perimeter = useMemo(() => {
    // initial perimeter 3 * 320 = 960 (in pixel units)
    return 3 * 320 * Math.pow(4 / 3, depth);
  }, [depth]);
  const segments = useMemo(() => 3 * Math.pow(4, depth), [depth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 400, 400);

    // filled interior (soft glow)
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(200, 200, 50, 200, 200, 220);
    grad.addColorStop(0, "rgba(125, 249, 255, 0.18)");
    grad.addColorStop(1, "rgba(179, 136, 255, 0.04)");
    ctx.fillStyle = grad;
    ctx.fill();

    // outline
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "#7df9ff";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = "#7df9ff";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [points]);

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
      <div className="grid place-items-center">
        <canvas
          ref={canvasRef}
          style={{ width: 400, height: 400 }}
          className="rounded-2xl border border-white/8 bg-ink-900/60"
        />
      </div>

      <div className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            iterations
          </p>
          <input
            type="range"
            min={0}
            max={6}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="mt-3 w-full accent-neon-cyan"
          />
          <div className="mt-1 font-mono text-xs text-neon-cyan">n = {depth}</div>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-xs text-white/40">segments</dt>
              <dd className="font-mono text-xl text-neon-cyan">
                {segments.toLocaleString("en")}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-white/40">perimeter (×original)</dt>
              <dd className="font-mono text-xl text-neon-violet">
                {Math.pow(4 / 3, depth).toFixed(4)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-white/40">at n→∞</dt>
              <dd className="font-mono text-base text-neon-magenta">∞</dd>
            </div>
          </dl>
        </div>

        <div className="glass rounded-2xl p-4 text-xs text-white/55">
          The Koch snowflake's perimeter grows by (4/3) each iteration —
          unbounded — yet the whole figure stays comfortably inside a finite
          area. Infinity hides in the wrinkles.
        </div>
      </div>
    </div>
  );
}
