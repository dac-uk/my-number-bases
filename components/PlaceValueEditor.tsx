"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export type WeightMode = "powers" | "custom" | "anchored";

interface Props {
  base: number;          // 2..36
  symbols: string[];     // length === base; symbols[i] is the glyph for digit value i (standard) or (i+1) (bijective uses 1..base)
  bijective?: boolean;
  /**
   * "powers"   — each column's weight = base^position (standard positional)
   * "custom"   — every column's weight is independently editable
   * "anchored" — one column ("anchor") is editable; positions BELOW are powers
   *              of base; positions ABOVE follow an alternating
   *              "× base, × C/base^(K-1), × base, × C/base^(K-1), …" pattern.
   */
  weightMode: WeightMode;
  /** Anchored mode: which position (from the right, 0 = ones) is the anchor. */
  anchorPos?: number;
  /** Anchored mode: the user-set weight at the anchor column. */
  anchorValue?: number;
  /** Anchored mode: change the anchor position (e.g. by clicking a column). */
  onAnchorPosChange?: (pos: number) => void;
  /** Anchored mode: change the anchor weight value. */
  onAnchorValueChange?: (value: number) => void;
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

// Compute the weight at a single position under "anchored" mode.
//
//   For p <  K : weight = base^p   (standard powers below the anchor)
//   For p == K : weight = C        (the user-set value)
//   For p >  K : alternating multipliers, starting with × base:
//                  pos K+1 = C · base
//                  pos K+2 = C · base · R      where R = C / base^(K-1)
//                  pos K+3 = C · base² · R
//                  pos K+4 = C · base² · R²
//                  ...
//                For K = 0 we use R = C · base instead of dividing by base^-1.
function anchoredWeightAtPos(
  pos: number,
  base: number,
  anchorPos: number,
  anchorValue: number,
): number {
  if (pos < anchorPos) return Math.pow(base, pos);
  if (pos === anchorPos) return anchorValue;
  const delta = pos - anchorPos;
  const r =
    anchorPos >= 1 ? anchorValue / Math.pow(base, anchorPos - 1) : anchorValue * base;
  const nBase = Math.ceil(delta / 2);
  const nR = Math.floor(delta / 2);
  return anchorValue * Math.pow(base, nBase) * Math.pow(r, nR);
}

function anchoredWeights(
  len: number,
  base: number,
  anchorPos: number,
  anchorValue: number,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < len; i += 1) {
    const pos = len - 1 - i;
    out.push(anchoredWeightAtPos(pos, base, anchorPos, anchorValue));
  }
  return out;
}

function composeStandard(digits: number[], base: number): number {
  let v = 0;
  for (const d of digits) v = v * base + d;
  return v;
}

function composeWithWeights(digits: number[], weights: number[]): number {
  let s = 0;
  for (let i = 0; i < digits.length; i += 1) {
    s += digits[i] * (weights[i] ?? 0);
  }
  return s;
}

// Pretty-print the formula behind a derived weight in anchored mode.
function anchoredFormulaLabel(
  pos: number,
  base: number,
  anchorPos: number,
): string {
  if (pos < anchorPos) return `${base}^${pos}`;
  if (pos === anchorPos) return "C (anchor)";
  const delta = pos - anchorPos;
  const nBase = Math.ceil(delta / 2);
  const nR = Math.floor(delta / 2);
  // R = C / base^(K-1) so C · base^a · R^b can be re-written more simply.
  // Express directly: weight = base^nBase · C^(nR + 1) / base^((K-1)·nR)
  const baseExp = nBase - (anchorPos - 1) * nR;
  const cExp = nR + 1;
  let str = "";
  if (baseExp !== 0) str += `${base}${baseExp === 1 ? "" : `^${baseExp}`}`;
  if (cExp !== 0) {
    if (str) str += " · ";
    str += `C${cExp === 1 ? "" : `^${cExp}`}`;
  }
  return str || "1";
}

export function PlaceValueEditor({
  base,
  symbols,
  bijective = false,
  weightMode,
  anchorPos = 0,
  anchorValue = 1,
  onAnchorPosChange,
  onAnchorValueChange,
  value,
  onChange,
}: Props) {
  // Derived "standard" state from the external value.
  const derivedDigits = useMemo(
    () => decompose(value, base, bijective),
    [value, base, bijective],
  );

  // "Custom" and "anchored" modes both want LOCAL digit state so that
  // adjusting the weights / anchor (which changes the resulting decimal)
  // doesn't make the cells jump around.  We seed the local state from the
  // standard decomposition the first time we enter such a mode (or on base /
  // bijective change).
  const ownsDigits = weightMode === "custom" || weightMode === "anchored";
  const [localDigits, setLocalDigits] = useState<number[]>(derivedDigits);
  const [customW, setCustomW] = useState<number[]>(() =>
    standardWeights(derivedDigits.length, base),
  );

  const prevMode = useRef<WeightMode>(weightMode);
  useEffect(() => {
    const enteringOwning =
      (weightMode === "custom" || weightMode === "anchored") &&
      prevMode.current !== weightMode;
    if (enteringOwning) {
      setLocalDigits(derivedDigits);
      if (weightMode === "custom") {
        setCustomW(standardWeights(derivedDigits.length, base));
      }
    }
    prevMode.current = weightMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightMode]);

  // Re-seed when the base or bijective flag changes inside an owning mode.
  useEffect(() => {
    if (!ownsDigits) return;
    setLocalDigits(derivedDigits);
    if (weightMode === "custom") {
      setCustomW(standardWeights(derivedDigits.length, base));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, bijective]);

  const digits = ownsDigits ? localDigits : derivedDigits;

  // Weights — len always tracks `digits.length` so adding a leading column
  // recomputes the right number of anchored weights.
  const weightsLen = digits.length;
  const stdWeights = useMemo(
    () => standardWeights(weightsLen, base),
    [weightsLen, base],
  );
  const anchWeights = useMemo(
    () => anchoredWeights(weightsLen, base, anchorPos, anchorValue),
    [weightsLen, base, anchorPos, anchorValue],
  );
  const weights =
    weightMode === "custom"
      ? customW
      : weightMode === "anchored"
        ? anchWeights
        : stdWeights;

  // In anchored mode the decimal value follows Σ d_i · w_i; when the user
  // changes anchorPos or anchorValue the weights shift and the value must
  // re-publish.  A ref guards against the obvious onChange→value→effect loop.
  const lastOutRef = useRef<number>(value);
  useEffect(() => {
    if (weightMode !== "anchored") return;
    const v = composeWithWeights(localDigits, anchWeights);
    if (v !== lastOutRef.current) {
      lastOutRef.current = v;
      onChange(v);
    }
  }, [weightMode, anchWeights, localDigits, onChange]);

  const [focused, setFocused] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const minDigit = bijective ? 1 : 0;
  const maxDigit = bijective ? base : base - 1;

  const commitDigits = (
    nextDigits: number[],
    nextWeights: number[] = weights,
  ) => {
    if (weightMode === "custom") {
      setLocalDigits(nextDigits);
      setCustomW(nextWeights);
      const v = composeWithWeights(nextDigits, nextWeights);
      lastOutRef.current = v;
      onChange(v);
    } else if (weightMode === "anchored") {
      setLocalDigits(nextDigits);
      const w = anchoredWeights(nextDigits.length, base, anchorPos, anchorValue);
      const v = composeWithWeights(nextDigits, w);
      lastOutRef.current = v;
      onChange(v);
    } else {
      onChange(composeStandard(nextDigits, base));
    }
  };

  const commitCustomWeights = (nextWeights: number[]) => {
    setCustomW(nextWeights);
    const v = composeWithWeights(digits, nextWeights);
    lastOutRef.current = v;
    onChange(v);
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
    commitCustomWeights(next);
  };

  const addLeading = () => {
    const newDigits = [minDigit === 0 ? 1 : minDigit, ...digits];
    if (weightMode === "custom") {
      const leadingWeight = weights[0] ?? 1;
      const newWeights = [leadingWeight * base, ...weights];
      commitDigits(newDigits, newWeights);
    } else {
      commitDigits(newDigits);
    }
  };

  const removeLeading = () => {
    if (digits.length <= 1) {
      commitDigits(bijective ? [] : [0], bijective ? [] : [1]);
      return;
    }
    if (weightMode === "custom") {
      commitDigits(digits.slice(1), weights.slice(1));
    } else {
      commitDigits(digits.slice(1));
    }
  };

  const snapWeightsToPowers = () => {
    commitCustomWeights(standardWeights(digits.length, base));
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

  const COLUMN_HEIGHT =
    weightMode === "powers" ? 184 : 236;

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
          const isAnchor = weightMode === "anchored" && power === anchorPos;
          const formula =
            weightMode === "anchored"
              ? anchoredFormulaLabel(power, base, anchorPos)
              : "";

          return (
            <div
              key={i}
              className="flex w-[78px] shrink-0 flex-col items-stretch gap-1.5"
            >
              {/* Top: weight (custom/anchor) or power label */}
              {weightMode === "custom" ? (
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
              ) : weightMode === "anchored" ? (
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => onAnchorPosChange?.(power)}
                    title={
                      isAnchor
                        ? "Anchor column"
                        : "Click to make this column the anchor"
                    }
                    className={`font-mono text-[9px] uppercase tracking-[0.18em] transition ${
                      isAnchor
                        ? "text-neon-gold"
                        : "text-white/35 hover:text-white/70"
                    }`}
                  >
                    {isAnchor ? "★ anchor" : "set anchor"}
                  </button>
                  {isAnchor ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={anchorValue}
                      onChange={(e) =>
                        onAnchorValueChange?.(Number(e.target.value) || 0)
                      }
                      className="h-8 w-full rounded-md border border-neon-gold/50 bg-neon-gold/5 px-1 text-center font-mono text-[13px] text-neon-gold outline-none focus:border-neon-gold/80 focus:bg-neon-gold/10"
                    />
                  ) : (
                    <span
                      className="grid h-8 w-full place-items-center rounded-md border border-white/10 bg-ink-900/50 px-1 text-center font-mono text-[13px] text-white/70"
                      title={`= ${formula}`}
                    >
                      {Number.isFinite(w)
                        ? Number(w.toFixed(4)).toString()
                        : "—"}
                    </span>
                  )}
                </div>
              ) : (
                <span className="block h-8 pt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {base}<sup>{power}</sup>
                </span>
              )}

              {/* Formula caption — only in anchored mode */}
              {weightMode === "anchored" && (
                <span
                  className="block h-3 text-center font-mono text-[9px] leading-3 text-white/40"
                  title={formula}
                >
                  {formula}
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
                    isAnchor
                      ? "border-neon-gold/50 bg-neon-gold/5 text-white shadow-[0_0_24px_-8px_rgba(245,199,106,0.5)]"
                      : isFocused
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
                title={`${d} × ${w}`}
              >
                = {Number.isFinite(w) ? (d * w).toLocaleString("en") : "—"}
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
        {weightMode === "custom" && (
          <button
            onClick={snapWeightsToPowers}
            className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-neon-cyan/60 hover:text-neon-cyan"
            title={`Reset weights to ${base}^p`}
          >
            ↺ snap weights to {base}<sup>p</sup>
          </button>
        )}
        {weightMode === "anchored" && (
          <button
            onClick={() => {
              onAnchorValueChange?.(Math.pow(base, anchorPos));
            }}
            className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-neon-gold/60 hover:text-neon-gold"
            title={`Reset the anchor's value to ${base}^${anchorPos}`}
          >
            ↺ reset anchor to {base}<sup>{anchorPos}</sup>
          </button>
        )}
      </div>
    </div>
  );
}
