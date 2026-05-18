"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Counter = (s: string) => number;

interface Predicate {
  id: string;
  label: string;
  template: (n: number) => string;
  count: Counter;
}

const PREDICATES: Predicate[] = [
  {
    id: "letters",
    label: "letters (a–z)",
    template: (n) => `This sentence has ${n} letters.`,
    count: (s) => (s.match(/[A-Za-z]/g) || []).length,
  },
  {
    id: "words",
    label: "words",
    template: (n) => `This sentence contains ${n} words.`,
    count: (s) => s.trim().split(/\s+/).filter(Boolean).length,
  },
  {
    id: "es",
    label: "occurrences of the letter 'e'",
    template: (n) => `This sentence has ${n} occurrences of the letter 'e'.`,
    count: (s) => (s.toLowerCase().match(/e/g) || []).length,
  },
  {
    id: "vowels",
    label: "vowels",
    template: (n) => `This sentence contains ${n} vowels.`,
    count: (s) => (s.toLowerCase().match(/[aeiou]/g) || []).length,
  },
  {
    id: "spaces",
    label: "spaces",
    template: (n) => `This sentence contains ${n} spaces.`,
    count: (s) => (s.match(/ /g) || []).length,
  },
];

function findFixedPoint(p: Predicate, maxN = 200): number[] {
  const out: number[] = [];
  for (let n = 0; n <= maxN; n += 1) {
    if (p.count(p.template(n)) === n) out.push(n);
  }
  return out;
}

export function SelfReference() {
  const [pid, setPid] = useState<string>("letters");
  const pred = PREDICATES.find((p) => p.id === pid)!;

  const fixed = useMemo(() => findFixedPoint(pred), [pred]);
  const [trialN, setTrialN] = useState(0);
  const trialSentence = pred.template(trialN);
  const trialActual = pred.count(trialSentence);
  const isFixed = trialActual === trialN;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 1 · choose the predicate
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PREDICATES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPid(p.id);
                  setTrialN(0);
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  p.id === pid
                    ? "bg-white/10 text-white"
                    : "border border-white/10 text-white/55 hover:border-neon-cyan/60 hover:text-neon-cyan"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 2 · pick a number N and test the sentence
          </p>
          <input
            type="range"
            min={0}
            max={60}
            value={trialN}
            onChange={(e) => setTrialN(Number(e.target.value))}
            className="mt-3 w-full accent-neon-cyan"
          />
          <p className="mt-1 font-mono text-xs text-neon-cyan">N = {trialN}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={trialSentence}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-white/8 bg-ink-900/40 p-4 font-display text-xl italic text-white/90"
            >
              "{trialSentence}"
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 font-mono text-sm">
            actual {pred.label}:{" "}
            <span className={isFixed ? "text-neon-mint" : "text-neon-magenta"}>
              {trialActual}
            </span>
            <span className="ml-3 text-white/45">
              {isFixed ? "✓ self-consistent (fixed point)" : "✗ not yet"}
            </span>
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 3 · every fixed point
          </p>
          <p className="mt-3 font-mono text-sm">
            {fixed.length === 0 ? (
              <span className="text-neon-magenta">
                no value of N ≤ 200 makes the sentence true — this template has no
                fixed point in the integers
              </span>
            ) : (
              <span>
                values of N for which the sentence is self-consistent:{" "}
                <span className="text-neon-mint">{fixed.join(", ")}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5 text-sm text-white/65">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan">
            why this matters
          </p>
          <p className="mt-3">
            Gödel's first incompleteness theorem uses exactly this trick. He
            constructed a number-theoretic sentence G that, decoded, says "G
            is not provable in this system" — a true sentence the system
            cannot prove.
          </p>
          <p className="mt-3">
            The mechanical core is the same as the toy here: build a sentence
            that <em>refers to itself</em> by quoting a count, then find the
            value that makes it self-consistent. The diagonal lemma promises
            such a sentence always exists, in any sufficiently powerful
            system.
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-xs text-white/55">
          <p className="font-mono uppercase tracking-[0.18em] text-white/40">
            paradoxes too
          </p>
          <p className="mt-2 italic text-white/75">
            "This sentence is false."
          </p>
          <p className="mt-2">
            Self-reference also produces paradox. When the sentence asserts
            its own falsehood, every value is wrong — there's no fixed point.
            Gödel's genius was to swap "false" for "unprovable", which
            <em> can</em> be true.
          </p>
        </div>
      </aside>
    </div>
  );
}
