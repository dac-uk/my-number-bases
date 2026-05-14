"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface Choice {
  id: "phi" | "sqrt2" | "pi" | "e";
  label: string;
  expansion: (i: number) => number; // term a_i (i starts at 0 for the integer part)
  closed: string;
  value: number;
}

const CHOICES: Choice[] = [
  {
    id: "phi",
    label: "φ — golden ratio",
    expansion: () => 1,
    closed: "(1 + √5) / 2",
    value: (1 + Math.sqrt(5)) / 2,
  },
  {
    id: "sqrt2",
    label: "√2",
    expansion: (i) => (i === 0 ? 1 : 2),
    closed: "√2",
    value: Math.sqrt(2),
  },
  {
    id: "e",
    label: "e",
    expansion: (i) => {
      // [2; 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, …]
      if (i === 0) return 2;
      const k = i - 1;
      const m = k % 3;
      if (m === 1) return 2 * Math.floor(k / 3 + 1);
      return 1;
    },
    closed: "e",
    value: Math.E,
  },
  {
    id: "pi",
    label: "π",
    expansion: (i) => {
      // [3; 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, …]
      const terms = [3, 7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1];
      return terms[i] ?? 1;
    },
    closed: "π",
    value: Math.PI,
  },
];

function convergent(terms: number[]): { num: number; den: number; value: number } {
  if (terms.length === 0) return { num: 0, den: 1, value: 0 };
  let h1 = 1;
  let h0 = terms[0];
  let k1 = 0;
  let k0 = 1;
  for (let i = 1; i < terms.length; i += 1) {
    const a = terms[i];
    const h = a * h0 + h1;
    const k = a * k0 + k1;
    h1 = h0;
    h0 = h;
    k1 = k0;
    k0 = k;
  }
  return { num: h0, den: k0, value: h0 / k0 };
}

export function ContinuedFraction() {
  const [choiceId, setChoiceId] = useState<Choice["id"]>("phi");
  const [depth, setDepth] = useState(5);
  const choice = CHOICES.find((c) => c.id === choiceId)!;

  const terms = useMemo(
    () => Array.from({ length: depth }, (_, i) => choice.expansion(i)),
    [choice, depth],
  );
  const conv = useMemo(() => convergent(terms), [terms]);
  const error = Math.abs(conv.value - choice.value);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            onClick={() => setChoiceId(c.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              c.id === choiceId
                ? "bg-white/10 text-white"
                : "border border-white/10 text-white/55 hover:border-neon-cyan/60 hover:text-neon-cyan"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="glass-strong overflow-x-auto rounded-2xl p-6">
        <div className="flex items-center gap-1 font-mono text-xl text-white/85">
          <span className="text-neon-cyan">{terms[0]}</span>
          {terms.length > 1 && (
            <>
              <span className="text-white/40"> + </span>
              <NestedFraction
                terms={terms.slice(1)}
                depthLabelStart={1}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            depth
          </p>
          <input
            type="range"
            min={1}
            max={10}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="mt-3 w-full accent-neon-cyan"
          />
          <p className="mt-1 font-mono text-xs text-neon-cyan">
            depth = {depth}
          </p>
          <p className="mt-4 font-mono text-xs text-white/40">
            [{terms.join("; ").replace(";", ";")}]
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            convergent
          </p>
          <motion.p
            key={`${conv.num}/${conv.den}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-mono text-2xl text-neon-violet"
          >
            {conv.num.toLocaleString("en")} / {conv.den.toLocaleString("en")}
          </motion.p>
          <p className="mt-3 font-mono text-lg text-neon-cyan">
            ≈ {conv.value.toFixed(10)}
          </p>
          <p className="mt-2 font-mono text-xs text-white/45">
            target ({choice.closed}) = {choice.value.toFixed(10)}
          </p>
          <p className="mt-2 font-mono text-xs text-neon-magenta">
            error: {error.toExponential(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function NestedFraction({
  terms,
  depthLabelStart,
}: {
  terms: number[];
  depthLabelStart: number;
}) {
  if (terms.length === 0) return null;
  const [first, ...rest] = terms;
  return (
    <span className="inline-flex flex-col items-center px-1">
      <span className="text-white/35 text-sm">1</span>
      <span className="my-0.5 h-px w-12 bg-white/30" />
      <span className="flex items-center gap-1 text-sm">
        <span className="text-neon-cyan">{first}</span>
        {rest.length > 0 && (
          <>
            <span className="text-white/40 text-xs">+</span>
            <NestedFraction terms={rest} depthLabelStart={depthLabelStart + 1} />
          </>
        )}
      </span>
    </span>
  );
}
