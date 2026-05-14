"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SYSTEMS, parseStandardBase, type ConversionResult } from "@/lib/bases";

const PRESETS = [42, 100, 255, 1000, 1729, 65535];

export function BaseConverter() {
  const [inputBase, setInputBase] = useState(10);
  const [inputText, setInputText] = useState("1729");

  const numericValue = useMemo(() => {
    try {
      return parseStandardBase(inputText, inputBase);
    } catch {
      return NaN;
    }
  }, [inputText, inputBase]);

  const isValid = Number.isFinite(numericValue);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="glass-strong h-fit rounded-3xl p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Input
        </p>
        <label className="mt-4 block">
          <span className="text-sm text-white/60">From base</span>
          <input
            type="range"
            min={2}
            max={36}
            value={inputBase}
            onChange={(e) => setInputBase(Number(e.target.value))}
            className="mt-2 w-full accent-neon-cyan"
          />
          <div className="mt-1 flex justify-between font-mono text-xs text-white/50">
            <span>2</span>
            <span className="text-neon-cyan">base {inputBase}</span>
            <span>36</span>
          </div>
        </label>

        <label className="mt-6 block">
          <span className="text-sm text-white/60">Number</span>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value.toUpperCase())}
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 font-mono text-2xl tracking-wider text-white outline-none focus:border-neon-cyan/60"
            placeholder="0"
          />
          {!isValid && (
            <span className="mt-2 block text-xs text-neon-magenta">
              Not a valid number in base {inputBase}
            </span>
          )}
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="text-xs text-white/40">Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setInputBase(10);
                setInputText(String(p));
              }}
              className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-xs text-white/60 hover:border-neon-cyan/60 hover:text-neon-cyan"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-white/5 bg-ink-900/40 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Decimal value
          </p>
          <p className="mt-2 font-mono text-2xl text-neon-cyan">
            {isValid ? numericValue.toLocaleString("en", { maximumFractionDigits: 8 }) : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SYSTEMS.map((sys) => {
          let result: ConversionResult | null = null;
          let error: string | null = null;
          try {
            result = isValid ? sys.convert(numericValue) : null;
          } catch (e) {
            error = e instanceof Error ? e.message : "error";
          }
          return (
            <SystemCard
              key={sys.id}
              label={sys.label}
              description={sys.description}
              result={result}
              error={error}
            />
          );
        })}
      </div>
    </div>
  );
}

function SystemCard({
  label,
  description,
  result,
  error,
}: {
  label: string;
  description: string;
  result: ConversionResult | null;
  error: string | null;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg tracking-tight">{label}</p>
          <p className="text-sm text-white/50">{description}</p>
        </div>
        {result && (
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              digits
            </p>
            <p className="font-mono text-sm text-white/70">{result.digits.length}</p>
          </div>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-sm text-neon-magenta"
            >
              {error}
            </motion.p>
          ) : result ? (
            <motion.div
              key={result.notation}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-baseline gap-1 whitespace-nowrap"
            >
              {result.digits.map((d, i) => (
                <span
                  key={i}
                  className="digit text-white"
                  style={{ textShadow: "0 0 24px rgba(125,249,255,0.25)" }}
                >
                  {d}
                </span>
              ))}
              {result.fractionalDigits && result.fractionalDigits.length > 0 && (
                <>
                  <span className="digit text-white/40">.</span>
                  {result.fractionalDigits.map((d, i) => (
                    <span key={`f${i}`} className="digit text-white/60">
                      {d}
                    </span>
                  ))}
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
