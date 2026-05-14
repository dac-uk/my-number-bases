"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  base: number;          // 2..36
  symbols: string[];     // length === base; symbols[i] is the glyph for digit value i (standard) or (i+1) (bijective uses 1..base)
  bijective?: boolean;
  value: number;
  onChange: (v: number) => void;
}

function decompose(n: number, base: number, bijective: boolean): number[] {
  let x = Math.trunc(Math.abs(n));
  if (x === 0) return bijective ? [] : [0];
  const digits: number[] = [];
  if (bijective) {
    while (x > 0) {
      const r = (x - 1) % base;
      const d = r + 1;
      digits.unshift(d);
      x = (x - d) / base;
    }
  } else {
    while (x > 0) {
      digits.unshift(x % base);
      x = Math.floor(x / base);
    }
  }
  return digits;
}

function compose(digits: number[], base: number): number {
  let v = 0;
  for (const d of digits) v = v * base + d;
  return v;
}

export function PlaceValueEditor({
  base,
  symbols,
  bijective = false,
  value,
  onChange,
}: Props) {
  // local digit state to allow editing without losing focus on each keystroke
  const externalDigits = useMemo(
    () => decompose(value, base, bijective),
    [value, base, bijective],
  );
  const [digits, setDigits] = useState<number[]>(externalDigits);
  const [focused, setFocused] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // sync when external value changes (e.g. user typed elsewhere)
  useEffect(() => {
    setDigits(externalDigits);
  }, [externalDigits]);

  const minDigit = bijective ? 1 : 0;
  const maxDigit = bijective ? base : base - 1;

  const commit = (next: number[]) => {
    setDigits(next);
    onChange(compose(next, base));
  };

  const adjust = (i: number, delta: number) => {
    const next = [...digits];
    const target = (next[i] ?? minDigit) + delta;
    if (target < minDigit) {
      // wrap to top of range
      next[i] = maxDigit;
    } else if (target > maxDigit) {
      next[i] = minDigit;
    } else {
      next[i] = target;
    }
    commit(next);
  };

  const setDigitAt = (i: number, v: number) => {
    const clamped = Math.max(minDigit, Math.min(maxDigit, v));
    const next = [...digits];
    next[i] = clamped;
    commit(next);
  };

  const addLeading = () => {
    commit([minDigit === 0 ? 1 : minDigit, ...digits]); // start with smallest meaningful value
  };

  const removeLeading = () => {
    if (digits.length <= 1) {
      commit(bijective ? [] : [0]);
      return;
    }
    commit(digits.slice(1));
  };

  // empty bijective representation is allowed (== 0). Show a placeholder cell.
  const renderDigits = digits.length === 0 ? [] : digits;

  const onCellKey = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      adjust(i, +1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      adjust(i, -1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const t = cellRefs.current[i - 1];
      t?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const t = cellRefs.current[i + 1];
      t?.focus();
    } else if (e.key.length === 1) {
      // type a glyph
      const idx = symbols.indexOf(e.key.toUpperCase());
      if (idx >= 0) {
        e.preventDefault();
        const target = bijective ? idx + 1 : idx;
        setDigitAt(i, target);
      }
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      setDigitAt(i, minDigit);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 overflow-x-auto pb-2">
        <button
          onClick={addLeading}
          className="flex h-[100px] w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 text-white/50 transition hover:border-neon-cyan/60 hover:text-neon-cyan"
          title="Add a high-order digit"
        >
          +
        </button>
        {renderDigits.map((d, i) => {
          const power = renderDigits.length - 1 - i;
          const weight = Math.pow(base, power);
          const symbol = bijective ? symbols[d - 1] ?? "?" : symbols[d] ?? "?";
          const isLeading = i === 0;
          const isFocused = focused === i;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                {base}^{power}
              </span>
              <div className="relative">
                <button
                  onClick={() => adjust(i, +1)}
                  className="absolute -top-1 left-1/2 grid h-6 w-8 -translate-x-1/2 -translate-y-full place-items-center rounded-md border border-white/10 bg-ink-900/80 text-white/60 hover:border-neon-cyan/60 hover:text-neon-cyan"
                  aria-label="increment"
                >
                  ▲
                </button>
                <motion.button
                  ref={(el) => {
                    cellRefs.current[i] = el;
                  }}
                  onClick={() => adjust(i, +1)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    adjust(i, -1);
                  }}
                  onFocus={() => setFocused(i)}
                  onBlur={() => setFocused((f) => (f === i ? null : f))}
                  onKeyDown={onCellKey(i)}
                  layout
                  className={`grid h-[100px] w-[64px] place-items-center rounded-xl border font-mono text-3xl tracking-wider transition ${
                    isFocused
                      ? "border-neon-cyan/70 bg-neon-cyan/10 text-white shadow-glow"
                      : "border-white/10 bg-ink-900/60 text-white/95 hover:border-white/25"
                  }`}
                >
                  <motion.span
                    key={symbol}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {symbol}
                  </motion.span>
                </motion.button>
                <button
                  onClick={() => adjust(i, -1)}
                  className="absolute -bottom-1 left-1/2 grid h-6 w-8 -translate-x-1/2 translate-y-full place-items-center rounded-md border border-white/10 bg-ink-900/80 text-white/60 hover:border-neon-magenta/60 hover:text-neon-magenta"
                  aria-label="decrement"
                >
                  ▼
                </button>
                {isLeading && renderDigits.length > 0 && (
                  <button
                    onClick={removeLeading}
                    className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-white/10 bg-ink-900 text-[10px] text-white/50 hover:border-neon-magenta/60 hover:text-neon-magenta"
                    aria-label="remove leading digit"
                    title="Remove leading digit"
                  >
                    ×
                  </button>
                )}
              </div>
              <span className="mt-6 font-mono text-[10px] text-white/45">
                = {(d * weight).toLocaleString("en")}
              </span>
            </div>
          );
        })}
        {renderDigits.length === 0 && (
          <div className="flex h-[100px] items-center px-4 font-mono text-sm text-white/50">
            (empty representation = 0)
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          ↑/↓ adjust · ←/→ move · type a digit · right-click decrement
        </span>
      </div>
    </div>
  );
}
