"use client";

import { useState } from "react";
import { PatternCanvas, type PatternKind } from "@/components/PatternCanvas";

const KINDS: { id: PatternKind; label: string; description: string }[] = [
  { id: "modular", label: "Modular grid", description: "Cell (x, y) coloured by (x·y) mod n." },
  { id: "multiplication-circle", label: "Multiplication circle", description: "Connect each i on a circle to (i · k) mod n." },
  { id: "pascal-mod", label: "Pascal mod n", description: "Pascal's triangle, every entry taken modulo n. Sierpiński appears at n=2." },
  { id: "binary-pixels", label: "Digit mosaic", description: "Row n shows the digits of n in the chosen base." },
  { id: "ulam", label: "Palindrome spiral", description: "Ulam-style spiral; numbers whose digits are a palindrome in the base are coloured." },
];

export default function PatternsPage() {
  const [kind, setKind] = useState<PatternKind>("modular");
  const [base, setBase] = useState(7);
  const [param, setParam] = useState(2);

  const current = KINDS.find((k) => k.id === kind)!;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <span className="chip">Visualisation gallery</span>
        <h1 className="mt-4 font-display text-4xl tracking-tight">
          Patterns of bases
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Mathematics looks like nothing until you give it a colour. Try a
          different base and watch the structure rearrange itself.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex items-center justify-center">
          <PatternCanvas kind={kind} base={base} param={param} size={560} />
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Pattern
            </p>
            <div className="mt-3 grid gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    kind === k.id
                      ? "border-neon-cyan/60 bg-neon-cyan/10 text-white"
                      : "border-white/8 bg-ink-900/40 text-white/70 hover:border-white/20"
                  }`}
                >
                  <span className="block font-medium">{k.label}</span>
                  <span className="mt-0.5 block text-xs text-white/50">
                    {k.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Controls
            </p>
            <label className="mt-4 block text-sm">
              <span className="text-white/60">Base</span>
              <input
                type="range"
                min={2}
                max={36}
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
                className="mt-2 w-full accent-neon-cyan"
              />
              <span className="font-mono text-xs text-neon-cyan">n = {base}</span>
            </label>
            {kind === "multiplication-circle" && (
              <label className="mt-4 block text-sm">
                <span className="text-white/60">Factor k</span>
                <input
                  type="range"
                  min={2}
                  max={Math.max(2, base - 1)}
                  value={param}
                  onChange={(e) => setParam(Number(e.target.value))}
                  className="mt-2 w-full accent-neon-violet"
                />
                <span className="font-mono text-xs text-neon-violet">k = {param}</span>
              </label>
            )}
          </div>

          <div className="glass rounded-2xl p-5 text-sm text-white/60">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              You're looking at
            </p>
            <p className="mt-2 text-white/85">{current.label}.</p>
            <p className="mt-2">{current.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
