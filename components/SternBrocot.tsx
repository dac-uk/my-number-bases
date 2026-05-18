"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Frac {
  n: number;
  d: number;
}

const ZERO: Frac = { n: 0, d: 1 };
const INF: Frac = { n: 1, d: 0 };

function mediant(a: Frac, b: Frac): Frac {
  return { n: a.n + b.n, d: a.d + b.d };
}

function value(f: Frac): number {
  return f.d === 0 ? Infinity : f.n / f.d;
}

function fmt(f: Frac): string {
  if (f.d === 0) return "∞";
  return `${f.n}/${f.d}`;
}

// Walk the path "LRLRL…" from the root, collecting every node visited.
function buildPath(path: string): {
  left: Frac;
  right: Frac;
  here: Frac;
  trail: Frac[];
}[] {
  let L: Frac = ZERO;
  let R: Frac = INF;
  const out: { left: Frac; right: Frac; here: Frac; trail: Frac[] }[] = [];
  const trail: Frac[] = [];
  for (let i = 0; i < path.length; i += 1) {
    const here = mediant(L, R);
    trail.push(here);
    out.push({ left: L, right: R, here, trail: [...trail] });
    if (path[i] === "L") R = here;
    else L = here;
  }
  // include the next mediant too
  const here = mediant(L, R);
  trail.push(here);
  out.push({ left: L, right: R, here, trail: [...trail] });
  return out;
}

export function SternBrocot() {
  const [path, setPath] = useState("");

  const steps = useMemo(() => buildPath(path), [path]);
  const current = steps[steps.length - 1];

  const goLeft = () => setPath((p) => p + "L");
  const goRight = () => setPath((p) => p + "R");
  const back = () => setPath((p) => p.slice(0, -1));
  const reset = () => setPath("");

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            current fraction
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={fmt(current.here)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 font-mono text-5xl text-neon-gold"
            >
              {fmt(current.here)}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 font-mono text-sm text-white/55">
            ≈ {value(current.here).toFixed(6).replace(/0+$/, "0")}
            <span className="ml-4 text-white/40">
              mediant of <span className="text-white/70">{fmt(current.left)}</span> and{" "}
              <span className="text-white/70">{fmt(current.right)}</span>
            </span>
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            walk the tree
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={goLeft} className="btn-ghost text-sm">← smaller (L)</button>
            <button onClick={goRight} className="btn-ghost text-sm">larger (R) →</button>
            <button onClick={back} className="btn-ghost text-sm">↶ back</button>
            <button onClick={reset} className="btn-ghost text-sm">reset</button>
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            path so far
          </p>
          <p className="mt-1 break-all font-mono text-sm text-neon-gold">
            {path || "(root)"}
          </p>
        </div>

        <TreeView trail={current.trail} />
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5 text-sm text-white/65">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-gold">
            the mediant rule
          </p>
          <p className="mt-3">
            Start with the boundary <span className="font-mono">0/1</span> on the left and{" "}
            <span className="font-mono">1/0</span> (think "∞") on the right. The mediant of{" "}
            <span className="font-mono">a/b</span> and{" "}
            <span className="font-mono">c/d</span> is simply{" "}
            <span className="font-mono">(a+c)/(b+d)</span>.
          </p>
          <p className="mt-3">
            Going left replaces the right bound; going right replaces the left.
            Every positive rational appears exactly once, in lowest terms,
            somewhere in the tree.
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-xs text-white/55">
          <p className="font-mono uppercase tracking-[0.18em] text-white/40">
            try
          </p>
          <p className="mt-2">
            Keep alternating L R L R L R … and watch the fraction march toward
            φ = (1 + √5) / 2 — the golden ratio. The Fibonacci numbers are
            literally the path RLRLRL into the tree.
          </p>
        </div>
      </aside>
    </div>
  );
}

function TreeView({ trail }: { trail: Frac[] }) {
  // a simple horizontal sequence of fractions; the most recent on the right
  return (
    <div className="glass overflow-x-auto rounded-2xl p-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        your descent
      </p>
      <div className="mt-3 flex items-center gap-2 font-mono text-sm">
        {trail.map((f, i) => (
          <motion.span
            key={`${i}-${fmt(f)}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-md border px-2 py-1 ${
              i === trail.length - 1
                ? "border-neon-gold/60 bg-neon-gold/10 text-neon-gold"
                : "border-white/10 bg-ink-900/40 text-white/70"
            }`}
          >
            {fmt(f)}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
