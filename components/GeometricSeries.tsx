"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

// Recursively subdivides a rectangle into "halves" coloured by series index.
// At each step we cut the *longer* dimension in half, colour the first half
// with the current term and recurse on the second half.
function subdivide(
  x: number,
  y: number,
  w: number,
  h: number,
  remaining: number,
  out: { x: number; y: number; w: number; h: number; i: number }[],
  i = 0,
) {
  if (remaining === 0) return;
  const horizontal = w >= h;
  const cutSize = horizontal ? w / 2 : h / 2;
  const piece = horizontal
    ? { x, y, w: cutSize, h }
    : { x, y, w, h: cutSize };
  out.push({ ...piece, i });
  if (horizontal) subdivide(x + cutSize, y, cutSize, h, remaining - 1, out, i + 1);
  else subdivide(x, y + cutSize, w, cutSize, remaining - 1, out, i + 1);
}

const COLORS = [
  "#7df9ff", "#9bd9ff", "#b388ff", "#ff5fa2",
  "#f5c76a", "#7affc6", "#7df9ff", "#b388ff",
];

export function GeometricSeries() {
  const [n, setN] = useState(6);
  const ratio = 0.5;

  const pieces = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; i: number }[] = [];
    subdivide(0, 0, 100, 100, n, out);
    return out;
  }, [n]);

  const partial = useMemo(() => {
    let s = 0;
    for (let k = 1; k <= n; k += 1) s += Math.pow(ratio, k);
    return s;
  }, [n]);

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="aspect-square w-full rounded-2xl border border-white/8 bg-ink-900/40"
        >
          <rect x={0} y={0} width={100} height={100} fill="rgba(255,255,255,0.02)" />
          {pieces.map((p, idx) => (
            <motion.rect
              key={`${p.x}-${p.y}-${p.w}-${p.h}`}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06, duration: 0.25 }}
              style={{
                fill: COLORS[p.i % COLORS.length],
                fillOpacity: 0.55,
                stroke: "rgba(5,6,10,0.6)",
                strokeWidth: 0.5,
                transformOrigin: `${p.x + p.w / 2}px ${p.y + p.h / 2}px`,
              }}
            />
          ))}
        </svg>
      </div>

      <div className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            terms
          </p>
          <input
            type="range"
            min={1}
            max={12}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-3 w-full accent-neon-cyan"
          />
          <div className="mt-1 font-mono text-xs text-neon-cyan">
            N = {n}
          </div>

          <div className="mt-5 space-y-2 font-mono text-sm">
            <p className="text-white/55">partial sum</p>
            <p className="text-2xl text-neon-cyan">
              {partial.toFixed(8).replace(/0+$/, "0")}
            </p>
            <p className="mt-3 text-white/40">limit</p>
            <p className="text-xl text-neon-violet">1.00000000</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 text-xs text-white/55">
          <span className="font-mono text-white/85">
            ½ + ¼ + ⅛ + … = 1
          </span>
          <p className="mt-2">
            Each new term colours half of what's left. The square is never
            <em> quite</em> full, but its un-filled corner shrinks faster than
            you can blink. An infinite sum lives entirely inside a finite space.
          </p>
        </div>
      </div>
    </div>
  );
}
