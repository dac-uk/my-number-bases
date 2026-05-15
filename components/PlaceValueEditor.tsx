"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  base: number;          // 2..36
  symbols: string[];     // length === base; symbols[i] is the glyph for digit value i (standard) or (i+1) (bijective uses 1..base)
  bijective?: boolean;
  /**
   * When true, each column's weight is independently editable instead of being
   * fixed to base^position. The total decimal value becomes Σ digit_i × weight_i.
   */
  customWeights?: boolean;
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

function standardWeights(len: number, base: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < len; i += 1) {
    out.push(Math.pow(base, len - 1 - i));
  }
  return out;
}

function composeStandard(digits: number[], base: number): number {
  let v = 0;
  for (const d of digits) v = v * base + d;
  return v;
}

function composeCustom(digits: number[], weights: number[]): number {
  let s = 0;
  for (let i = 0; i < digits.length; i += 1) {
    s += digits[i] * (weights[i] ?? 0);
  }
  return s;
}

export function PlaceValueEditor({
  base,
  symbols,
  bijective = false,
  customWeights = false,
  value,
  onChange,
}: Props) {
  // Derived "standard" state from the external value (used both in standard
  // mode and as the seed when the user first switches into custom mode).
  const derivedDigits = useMemo(
    () => decompose(value, base, bijective),
    [value, base, bijective],
  );
  const derivedWeights = useMemo(
    () => standardWeights(derivedDigits.length, base),
    [derivedDigits.length, base],
  );

  // Local "custom" state.  Only consulted when customWeights === true.
  const [customDigits, setCustomDigits] = useState<number[]>(derivedDigits);
  const [customW, setCustomW] = useState<number[]>(derivedWeights);

  // Snapshot derived state when entering custom mode (and whenever base or
  // bijective change while inside custom mode).
  const wasCustom = useRef(false);
  useEffect(() => {
    if (customWeights && !wasCustom.current) {
      setCustomDigits(derivedDigits);
      setCustomW(derivedWeights);
    }
    wasCustom.current = customWeights;
  }, [customWeights, derivedDigits, derivedWeights]);

  // Also re-seed when base or bijective changes inside custom mode — the digit
  // range changed, so the existing digits could be out of bounds.
  useEffect(() => {
    if (!customWeights) return;
    setCustomDigits(derivedDigits);
    setCustomW(derivedWeights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, bijective]);

  const digits = customWeights ? customDigits : derivedDigits;
  const weights = customWeights ? customW : derivedWeights;

  const [focused, setFocused] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const minDigit = bijective ? 1 : 0;
  const maxDigit = bijective ? base : base - 1;

  const commitDigits = (nextDigits: number[], nextWeights: number[] = weights) => {
    if (customWeights) {
      setCustomDigits(nextDigits);
      setCustomW(nextWeights);
      onChange(composeCustom(nextDigits, nextWeights));
    } else {
      onChange(composeStandard(nextDigits, base));
    }
  };

  const commitWeights = (nextWeights: number[]) => {
    setCustomW(nextWeights);
    onChange(composeCustom(digits, nextWeights));
  };

  const adjust = (i: number, delta: number) => {
    const next = [...digits];
    const target = (next[i] ?? minDigit) + delta;
    if (target < minDigit) next[i] = maxDigit;
    else if (target > maxDigit) next[i] = minDigit;
    else next[i] = target;
    commitDigits(next);
  };

  const setDigitAt = (i: number, v: number) => {
    const clamped = Math.max(minDigit, Math.min(maxDigit, v));
    const next = [...digits];
    next[i] = clamped;
    commitDigits(next);
  };

  const setWeightAt = (i: number, w: number) => {
    const next = [...weights];
    next[i] = w;
    commitWeights(next);
  };

  const addLeading = () => {
    const newDigits = [minDigit === 0 ? 1 : minDigit, ...digits];
    const leadingWeight = weights[0] ?? 1;
    const newWeights = [leadingWeight * base, ...weights];
    commitDigits(newDigits, newWeights);
  };

  const removeLeading = () => {
    if (digits.length <= 1) {
      commitDigits(bijective ? [] : [0], bijective ? [] : [1]);
      return;
    }
    commitDigits(digits.slice(1), weights.slice(1));
  };

  const snapWeightsToPowers = () => {
    commitWeights(standardWeights(digits.length, base));
  };

  const renderDigits = digits.length === 0 ? [] : digits;

  const onCellKey =
    (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        adjust(i, +1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        adjust(i, -1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cellRefs.current[i - 1]?.focus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        cellRefs.current[i + 1]?.focus();
      } else if (e.key.length === 1) {
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

  // Total cell height we lock to so the "+" key and any empty-state matches.
  const COLUMN_HEIGHT = customWeights ? 224 : 184;

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
        <button
          onClick={addLeading}
          className="flex w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 text-xl text-white/50 transition hover:border-neon-cyan/60 hover:text-neon-cyan"
          style={{ height: COLUMN_HEIGHT }}
          title="Add a high-order digit"
        >
          +
        </button>
        {renderDigits.map((d, i) => {
          const w = weights[i] ?? 0;
          const power = renderDigits.length - 1 - i;
          const symbol = bijective ? symbols[d - 1] ?? "?" : symbols[d] ?? "?";
          const isLeading = i === 0;
          const isFocused = focused === i;

          return (
            <div
              key={i}
              className="flex w-[76px] shrink-0 flex-col items-stretch gap-1.5"
            >
              {/* Top: weight (custom mode) or power label (standard mode) */}
              {customWeights ? (
                <label className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon-violet/80">
                    × weight
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={w}
                    onChange={(e) =>
                      setWeightAt(i, Number(e.target.value) || 0)
                    }
                    className="h-8 w-full rounded-md border border-neon-violet/30 bg-ink-900/70 px-1 text-center font-mono text-[13px] text-neon-violet outline-none focus:border-neon-violet/70 focus:bg-neon-violet/10"
                  />
                </label>
              ) : (
                <span className="block h-8 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {base}<sup>{power}</sup>
                </span>
              )}

              {/* Increment */}
              <button
                onClick={() => adjust(i, +1)}
                className="grid h-6 w-full place-items-center rounded-md border border-white/10 bg-ink-900/70 text-white/60 transition hover:border-neon-cyan/60 hover:bg-neon-cyan/10 hover:text-neon-cyan"
                aria-label="increment"
              >
                ▲
              </button>

              {/* Digit cell */}
              <div className="relative">
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
                  onBlur={() =>
                    setFocused((f) => (f === i ? null : f))
                  }
                  onKeyDown={onCellKey(i)}
                  layout
                  className={`grid h-[88px] w-full place-items-center rounded-xl border font-mono text-3xl tracking-wider transition ${
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
                {isLeading && renderDigits.length > 0 && (
                  <button
                    onClick={removeLeading}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-white/10 bg-ink-950 text-[10px] text-white/55 hover:border-neon-magenta/60 hover:text-neon-magenta"
                    aria-label="remove leading digit"
                    title="Remove leading digit"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Decrement */}
              <button
                onClick={() => adjust(i, -1)}
                className="grid h-6 w-full place-items-center rounded-md border border-white/10 bg-ink-900/70 text-white/60 transition hover:border-neon-magenta/60 hover:bg-neon-magenta/10 hover:text-neon-magenta"
                aria-label="decrement"
              >
                ▼
              </button>

              {/* Contribution */}
              <span
                className="block truncate text-center font-mono text-[10px] text-white/55"
                title={`${d} × ${w} = ${d * w}`}
              >
                = {(d * w).toLocaleString("en")}
              </span>
            </div>
          );
        })}
        {renderDigits.length === 0 && (
          <div
            className="flex shrink-0 items-center rounded-xl border border-dashed border-white/10 px-4 font-mono text-sm text-white/50"
            style={{ height: COLUMN_HEIGHT }}
          >
            (empty representation = 0)
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-mono uppercase tracking-[0.2em] text-white/40">
          ↑/↓ adjust · ←/→ move · type a digit · right-click decrement
        </span>
        {customWeights && (
          <button
            onClick={snapWeightsToPowers}
            className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-neon-cyan/60 hover:text-neon-cyan"
            title={`Reset weights to ${base}^p`}
          >
            ↺ snap weights to {base}<sup>p</sup>
          </button>
        )}
      </div>
    </div>
  );
}
