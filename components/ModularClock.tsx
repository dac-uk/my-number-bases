"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function ModularClock() {
  const [n, setN] = useState(12);
  const [a, setA] = useState(0);
  const [b, setB] = useState(5);
  const [op, setOp] = useState<"add" | "mul">("add");

  const result = op === "add" ? (a + b) % n : (a * b) % n;
  const overflow = op === "add" ? a + b : a * b;
  const wraps = Math.floor(overflow / n);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <ClockDiagram n={n} from={a} to={result} highlight={a} />

        <div className="glass-strong rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink-900/40 p-1 text-sm">
              <button
                onClick={() => setOp("add")}
                className={`rounded-lg px-3 py-1.5 transition ${op === "add" ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
              >
                + add
              </button>
              <button
                onClick={() => setOp("mul")}
                className={`rounded-lg px-3 py-1.5 transition ${op === "mul" ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
              >
                × multiply
              </button>
            </div>
            <span className="ml-auto font-mono text-sm text-white/55">
              modulo <span className="text-neon-mint">{n}</span>
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Slider label="a" min={0} max={n - 1} value={a} onChange={setA} accent="neon-cyan" />
            <Slider label="b" min={0} max={n - 1} value={b} onChange={setB} accent="neon-violet" />
            <Slider label="n (modulus)" min={2} max={24} value={n} onChange={(v) => {
              setN(v);
              setA((x) => Math.min(x, v - 1));
              setB((x) => Math.min(x, v - 1));
            }} accent="neon-mint" />
          </div>

          <p className="mt-5 font-mono text-base text-white/85">
            <span className="text-neon-cyan">{a}</span>{" "}
            {op === "add" ? "+" : "×"}{" "}
            <span className="text-neon-violet">{b}</span>{" "}
            = {overflow}{" "}
            <span className="text-white/45">
              ≡{" "}
            </span>
            <span className="text-neon-mint">{result}</span>{" "}
            <span className="text-white/45">
              (mod {n}) — wraps {wraps}× around the clock
            </span>
          </p>
        </div>

        <Table n={n} op={op} />
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5 text-sm text-white/65">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-mint">
            why it's beautiful
          </p>
          <p className="mt-3">
            Modular arithmetic looks like a quirk of clocks. It turns out to be
            the natural setting for cryptography, error-correcting codes, group
            theory and competitive programming. Almost anywhere numbers wrap,
            this is the maths beneath.
          </p>
          <p className="mt-3 text-white/55">
            Try the multiplication table at n = 7 versus n = 6. One is a finite
            field — every non-zero row contains every value. The other isn't —
            zeros appear in the middle.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
  accent,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <label className="block text-xs">
      <span className="text-white/55">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-2 w-full accent-${accent}`}
      />
      <span className={`font-mono text-${accent}`}>{value}</span>
    </label>
  );
}

function ClockDiagram({
  n,
  from,
  to,
  highlight,
}: {
  n: number;
  from: number;
  to: number;
  highlight: number;
}) {
  const cx = 50;
  const cy = 50;
  const r = 38;
  const ticks = Array.from({ length: n }, (_, i) => {
    const angle = (-Math.PI / 2) + (i / n) * Math.PI * 2;
    return {
      i,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
  return (
    <div className="grid place-items-center">
      <svg
        viewBox="0 0 100 100"
        className="aspect-square w-full max-w-[380px] rounded-2xl border border-white/8 bg-ink-900/60"
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
        {ticks.map((t) => {
          const isHighlight = t.i === highlight;
          const isResult = t.i === to;
          return (
            <g key={t.i}>
              <circle
                cx={t.x}
                cy={t.y}
                r={isHighlight || isResult ? 2.2 : 1}
                fill={isResult ? "#7affc6" : isHighlight ? "#7df9ff" : "rgba(255,255,255,0.45)"}
                style={{ filter: isResult || isHighlight ? "drop-shadow(0 0 4px currentColor)" : undefined }}
              />
              <text
                x={t.x}
                y={t.y - 4}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 3.5, fill: isResult || isHighlight ? "currentColor" : "rgba(255,255,255,0.6)" }}
              >
                {t.i}
              </text>
            </g>
          );
        })}
        <motion.line
          x1={cx}
          y1={cy}
          x2={ticks[from % n].x}
          y2={ticks[from % n].y}
          stroke="#7df9ff"
          strokeWidth="0.6"
          strokeLinecap="round"
          initial={false}
          animate={{ x2: ticks[from % n].x, y2: ticks[from % n].y }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
        />
        <motion.line
          x1={cx}
          y1={cy}
          x2={ticks[to].x}
          y2={ticks[to].y}
          stroke="#7affc6"
          strokeWidth="1.1"
          strokeLinecap="round"
          initial={false}
          animate={{ x2: ticks[to].x, y2: ticks[to].y }}
          transition={{ type: "spring", stiffness: 100, damping: 14 }}
          style={{ filter: "drop-shadow(0 0 3px #7affc6)" }}
        />
      </svg>
    </div>
  );
}

function Table({ n, op }: { n: number; op: "add" | "mul" }) {
  return (
    <div className="glass-strong overflow-x-auto rounded-2xl p-3">
      <p className="px-2 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        {op === "add" ? "addition" : "multiplication"} mod {n}
      </p>
      <table className="font-mono text-xs">
        <thead>
          <tr>
            <th className="w-7 text-center text-white/40">{op === "add" ? "+" : "×"}</th>
            {Array.from({ length: n }, (_, c) => (
              <th key={c} className="w-7 text-center text-white/40">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: n }, (_, r) => (
            <tr key={r}>
              <td className="text-center text-white/40">{r}</td>
              {Array.from({ length: n }, (_, c) => {
                const v = op === "add" ? (r + c) % n : (r * c) % n;
                const t = v / Math.max(1, n - 1);
                return (
                  <td
                    key={c}
                    className="text-center"
                    style={{
                      backgroundColor: `hsla(${180 + t * 200}, 70%, 50%, 0.15)`,
                      color: v === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
