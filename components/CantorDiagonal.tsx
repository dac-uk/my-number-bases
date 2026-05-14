"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const ROWS = 8;
const COLS = 8;

function randomRow(): number[] {
  return Array.from({ length: COLS }, () => (Math.random() < 0.5 ? 0 : 1));
}

function randomMatrix(): number[][] {
  return Array.from({ length: ROWS }, () => randomRow());
}

export function CantorDiagonal() {
  const [matrix, setMatrix] = useState(randomMatrix);
  const [highlight, setHighlight] = useState(false);

  const diagonal = useMemo(
    () => matrix.map((row, i) => row[i]),
    [matrix],
  );
  const cantorNumber = diagonal.map((b) => (b === 0 ? 1 : 0));

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: "auto auto" }}>
          {matrix.map((row, r) => (
            <div key={r} className="contents">
              <div className="grid place-items-center pr-3 font-mono text-xs text-white/40">
                R{r + 1}
              </div>
              <div className="flex gap-1.5">
                {row.map((bit, c) => {
                  const isDiag = r === c;
                  return (
                    <motion.div
                      key={c}
                      animate={{
                        scale: highlight && isDiag ? 1.15 : 1,
                      }}
                      transition={{ delay: highlight && isDiag ? r * 0.05 : 0 }}
                      className={`grid h-9 w-9 place-items-center rounded-md font-mono text-base transition-colors ${
                        isDiag
                          ? "border-2 border-neon-cyan/70 bg-neon-cyan/10 text-neon-cyan"
                          : "border border-white/8 bg-ink-900/60 text-white/70"
                      }`}
                    >
                      {bit}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="grid place-items-center pr-3 font-mono text-xs text-neon-magenta">
            new
          </div>
          <div className="flex gap-1.5">
            {cantorNumber.map((bit, c) => (
              <motion.div
                key={c}
                animate={{ y: highlight ? 0 : 6, opacity: highlight ? 1 : 0.3 }}
                transition={{ delay: highlight ? c * 0.05 + 0.4 : 0 }}
                className="grid h-9 w-9 place-items-center rounded-md border border-neon-magenta/60 bg-neon-magenta/10 font-mono text-base text-neon-magenta"
              >
                {bit}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setHighlight(false);
            setMatrix(randomMatrix());
            setTimeout(() => setHighlight(true), 60);
          }}
          className="btn-ghost text-sm"
        >
          New "complete list"
        </button>
        <button
          onClick={() => setHighlight((h) => !h)}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-neon-magenta/60 hover:text-neon-magenta"
        >
          {highlight ? "Hide new number" : "Reveal new number"}
        </button>
      </div>

      <p className="text-sm text-white/55">
        Pretend the 8 rows above are a complete list of every binary string.
        Take the diagonal digit from each row, flip every bit — you've just
        built a string that <em>differs</em> from row 1 in column 1, row 2 in
        column 2, and so on. So it's not in the list. Repeat for any
        supposedly-complete list of real numbers: there is always one more.
      </p>
    </div>
  );
}
