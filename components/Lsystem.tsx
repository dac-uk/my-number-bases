"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Preset {
  id: string;
  label: string;
  axiom: string;
  rules: Record<string, string>;
  angle: number; // degrees
  iterations: number;
  startAngle: number; // degrees, 0 = right, 90 = up
  hint: string;
}

const PRESETS: Preset[] = [
  {
    id: "tree",
    label: "Fractal plant",
    axiom: "X",
    rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" },
    angle: 25,
    iterations: 5,
    startAngle: 90,
    hint: "Lindenmayer's classic — a stalk that branches into a fern.",
  },
  {
    id: "koch",
    label: "Koch snowflake",
    axiom: "F--F--F",
    rules: { F: "F+F--F+F" },
    angle: 60,
    iterations: 4,
    startAngle: 0,
    hint: "Triangle, each edge replaced with a bump, forever.",
  },
  {
    id: "dragon",
    label: "Dragon curve",
    axiom: "FX",
    rules: { X: "X+YF+", Y: "-FX-Y" },
    angle: 90,
    iterations: 11,
    startAngle: 0,
    hint: "Fold a strip of paper in half N times — this is what the creases look like.",
  },
  {
    id: "sierpinski",
    label: "Sierpiński arrowhead",
    axiom: "A",
    rules: { A: "B-A-B", B: "A+B+A" },
    angle: 60,
    iterations: 6,
    startAngle: 0,
    hint: "An L-system that traces out Sierpiński's triangle by walking.",
  },
];

function expand(axiom: string, rules: Record<string, string>, iters: number): string {
  let s = axiom;
  for (let i = 0; i < iters; i += 1) {
    let out = "";
    for (const ch of s) out += rules[ch] ?? ch;
    s = out;
    if (s.length > 200000) break; // safety cap
  }
  return s;
}

interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Stroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

interface Render {
  strokes: Stroke[];
  bbox: BBox;
  maxDepth: number;
}

function render(
  s: string,
  startAngle: number,
  angleStep: number,
  isDrawCmd: (c: string) => boolean,
): Render {
  const strokes: Stroke[] = [];
  const bbox: BBox = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  let x = 0;
  let y = 0;
  let heading = (startAngle * Math.PI) / 180;
  let depth = 0;
  let maxDepth = 0;
  const stack: { x: number; y: number; h: number; d: number }[] = [];
  for (const ch of s) {
    if (isDrawCmd(ch)) {
      const nx = x + Math.cos(heading);
      const ny = y - Math.sin(heading); // SVG y goes down
      strokes.push({ x1: x, y1: y, x2: nx, y2: ny, depth });
      x = nx;
      y = ny;
      if (x < bbox.minX) bbox.minX = x;
      if (x > bbox.maxX) bbox.maxX = x;
      if (y < bbox.minY) bbox.minY = y;
      if (y > bbox.maxY) bbox.maxY = y;
    } else if (ch === "+") {
      heading += (angleStep * Math.PI) / 180;
    } else if (ch === "-") {
      heading -= (angleStep * Math.PI) / 180;
    } else if (ch === "[") {
      stack.push({ x, y, h: heading, d: depth });
      depth += 1;
      if (depth > maxDepth) maxDepth = depth;
    } else if (ch === "]") {
      const st = stack.pop();
      if (st) {
        x = st.x;
        y = st.y;
        heading = st.h;
        depth = st.d;
      }
    }
  }
  return { strokes, bbox, maxDepth };
}

const DRAW_CHARS = new Set("FfABMRG".split(""));

export function Lsystem() {
  const [pid, setPid] = useState("tree");
  const preset = PRESETS.find((p) => p.id === pid)!;
  const [iters, setIters] = useState(preset.iterations);
  const [angle, setAngle] = useState(preset.angle);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // reset iters & angle when preset changes
  useEffect(() => {
    setIters(preset.iterations);
    setAngle(preset.angle);
  }, [preset.id, preset.iterations, preset.angle]);

  const expanded = useMemo(
    () => expand(preset.axiom, preset.rules, iters),
    [preset, iters],
  );

  const rendered = useMemo(
    () =>
      render(
        expanded,
        preset.startAngle,
        angle,
        (c) => DRAW_CHARS.has(c),
      ),
    [expanded, angle, preset.startAngle],
  );

  const VB = 100;
  const pad = 4;
  const { bbox, maxDepth } = rendered;
  const w = bbox.maxX - bbox.minX || 1;
  const h = bbox.maxY - bbox.minY || 1;
  const scale = (VB - 2 * pad) / Math.max(w, h);
  const offX = pad + (VB - 2 * pad - w * scale) / 2 - bbox.minX * scale;
  const offY = pad + (VB - 2 * pad - h * scale) / 2 - bbox.minY * scale;

  const colourFor = (depth: number): string => {
    const t = maxDepth > 0 ? depth / maxDepth : 0;
    return `hsl(${160 - t * 40}, 80%, ${65 - t * 25}%)`;
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB} ${VB}`}
          className="aspect-square w-full rounded-2xl border border-white/8 bg-ink-900/60"
        >
          {rendered.strokes.map((s, i) => (
            <line
              key={i}
              x1={offX + s.x1 * scale}
              y1={offY + s.y1 * scale}
              x2={offX + s.x2 * scale}
              y2={offY + s.y2 * scale}
              stroke={colourFor(s.depth)}
              strokeWidth={0.3}
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
        </svg>
        <p className="font-mono text-xs text-white/45">
          {expanded.length.toLocaleString("en")} characters · {rendered.strokes.length.toLocaleString("en")} strokes
        </p>
      </div>
      <aside className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            grammar
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPid(p.id)}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  p.id === pid
                    ? "border-neon-mint/60 bg-neon-mint/10 text-white"
                    : "border-white/8 bg-ink-900/40 text-white/70 hover:border-white/20"
                }`}
              >
                <span className="block font-medium">{p.label}</span>
                <span className="mt-0.5 block text-xs text-white/50">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            knobs
          </p>
          <label className="mt-3 block text-sm">
            <span className="text-white/55">iterations</span>
            <input
              type="range"
              min={0}
              max={Math.min(12, preset.iterations + 4)}
              value={iters}
              onChange={(e) => setIters(Number(e.target.value))}
              className="mt-2 w-full accent-neon-mint"
            />
            <span className="font-mono text-xs text-neon-mint">n = {iters}</span>
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-white/55">turn angle</span>
            <input
              type="range"
              min={5}
              max={120}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="mt-2 w-full accent-neon-mint"
            />
            <span className="font-mono text-xs text-neon-mint">{angle}°</span>
          </label>
        </div>
        <div className="glass rounded-2xl p-5 text-xs text-white/55">
          <p className="font-mono uppercase tracking-[0.18em] text-neon-mint">
            how it works
          </p>
          <p className="mt-2">
            Start with a short axiom. Every iteration, replace each character
            using the grammar's rules. Treat the resulting string as
            instructions for a turtle: <span className="font-mono text-white/80">F</span> /
            <span className="font-mono text-white/80"> A</span>{" "}/
            <span className="font-mono text-white/80">B</span> draw forward,
            <span className="font-mono text-white/80"> +</span> /
            <span className="font-mono text-white/80"> −</span> turn,
            <span className="font-mono text-white/80"> [</span> /
            <span className="font-mono text-white/80"> ]</span> push/pop state.
            That's all — and yet a fern emerges.
          </p>
        </div>
      </aside>
    </div>
  );
}
