"use client";

import { useMemo, useState } from "react";
import {
  bijectiveSymbols,
  toBalancedTernary,
  toBijective,
  toNegativeBase,
  toPhinary,
  toStandardBase,
} from "@/lib/bases";
import { toBaseMinusOnePlusI } from "@/lib/complex";
import { PlaceValueEditor } from "@/components/PlaceValueEditor";

interface CustomBaseConfig {
  base: number;        // integer base (can be negative, |b| >= 2)
  symbols: string;     // ordered digit symbols (length must == |base|)
}

interface PlaceValueConfig {
  base: number;        // 2..36
  bijective: boolean;
  customWeights: boolean;
  symbols: string;     // length === base
}

export default function SandboxPage() {
  const [value, setValue] = useState(42);

  // --- custom alphabet (existing) ---
  const [config, setConfig] = useState<CustomBaseConfig>({
    base: 7,
    symbols: "🜁🜂🜃🜄🜔🜕🜖",
  });
  const expectedLen = Math.abs(config.base);
  const symbols = useMemo(() => Array.from(config.symbols), [config.symbols]);
  const valid = symbols.length === expectedLen && expectedLen >= 2;

  const customRendering = useMemo(() => {
    if (!valid) return null;
    try {
      const result =
        config.base > 0
          ? toStandardBase(value, Math.max(2, Math.min(36, config.base)))
          : toNegativeBase(value, config.base);
      const glyphIndex = (g: string) =>
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(g);
      const rendered = result.digits
        .map((g) => symbols[glyphIndex(g)] ?? "?")
        .join(" ");
      return { rendered, raw: result.notation };
    } catch (e) {
      return { rendered: "—", raw: e instanceof Error ? e.message : "error" };
    }
  }, [value, config.base, symbols, valid]);

  // --- place-value editor ---
  const [pv, setPv] = useState<PlaceValueConfig>({
    base: 10,
    bijective: false,
    customWeights: false,
    symbols: "0123456789",
  });
  const pvSymbols = useMemo(() => Array.from(pv.symbols), [pv.symbols]);
  const pvExpectedLen = pv.base;
  const pvValid = pvSymbols.length === pvExpectedLen && pvExpectedLen >= 2;

  // Reset symbols when switching base/bijective if the count doesn't match
  const setBase = (b: number, bij: boolean = pv.bijective) => {
    const safeBase = Math.max(2, Math.min(36, Math.trunc(b)));
    const defaultSyms = bij
      ? bijectiveSymbols(safeBase)
      : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, safeBase);
    setPv((p) => ({
      base: safeBase,
      bijective: bij,
      customWeights: p.customWeights,
      symbols: defaultSyms,
    }));
  };

  const setCustomWeights = (cw: boolean) => {
    setPv((p) => ({ ...p, customWeights: cw }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">Sandbox</span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          What happens if…
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Invent your own digit alphabets, switch to bijective or negative
          bases, key each place value by hand, and compare arcane systems side
          by side. Mathematics is not a list of rules — it's a sandbox.
        </p>
      </header>

      <section className="mb-10 glass-strong rounded-2xl p-4 sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Place-value editor
            </p>
            <h2 className="mt-2 font-display text-xl tracking-tight sm:text-2xl">
              Edit each digit by hand
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/60">
              Increment, decrement, or type a glyph directly into any slot.
              Flip to <span className="text-neon-violet">Custom weights</span>{" "}
              to set each column's multiplier yourself.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              decimal
            </p>
            <p className="font-mono text-2xl text-neon-cyan sm:text-3xl">
              {value.toLocaleString("en")}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-white/55">Base</span>
              <input
                type="range"
                min={2}
                max={36}
                value={pv.base}
                onChange={(e) => setBase(Number(e.target.value), pv.bijective)}
                className="mt-2 w-full accent-neon-cyan"
              />
              <span className="font-mono text-xs text-neon-cyan">
                {pv.bijective ? "bijective " : ""}base {pv.base}
              </span>
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink-900/40 p-2 text-sm">
              <button
                onClick={() => setBase(pv.base, false)}
                className={`flex-1 rounded-lg px-3 py-1.5 transition ${
                  !pv.bijective
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setBase(pv.base, true)}
                className={`flex-1 rounded-lg px-3 py-1.5 transition ${
                  pv.bijective
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                Bijective
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink-900/40 p-2 text-sm">
              <button
                onClick={() => setCustomWeights(false)}
                className={`flex-1 rounded-lg px-3 py-1.5 transition ${
                  !pv.customWeights
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
                title={`Each column's weight = ${pv.base}^position`}
              >
                {pv.base}^p weights
              </button>
              <button
                onClick={() => setCustomWeights(true)}
                className={`flex-1 rounded-lg px-3 py-1.5 transition ${
                  pv.customWeights
                    ? "bg-neon-violet/15 text-neon-violet"
                    : "text-white/55 hover:text-white"
                }`}
                title="Edit each column's weight independently"
              >
                Custom weights
              </button>
            </div>

            {pv.customWeights && (
              <div className="rounded-xl border border-neon-violet/30 bg-neon-violet/5 p-3 text-xs text-white/65">
                <p className="font-mono uppercase tracking-[0.18em] text-neon-violet">
                  free-form positional system
                </p>
                <p className="mt-1.5 text-white/70">
                  Each column's weight is now an editable number. The decimal
                  value becomes{" "}
                  <span className="font-mono">Σ d<sub>i</sub> · w<sub>i</sub></span>.
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-white/55">
                  e.g. 1·210 + 2·9 + 3·2 = 234
                </p>
              </div>
            )}

            <label className="block">
              <span className="text-xs text-white/55">
                Symbols (need exactly {pvExpectedLen})
              </span>
              <input
                type="text"
                value={pv.symbols}
                onChange={(e) =>
                  setPv((p) => ({ ...p, symbols: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 font-mono tracking-widest"
              />
              <span
                className={`mt-1 block text-xs ${
                  pvValid ? "text-white/40" : "text-neon-magenta"
                }`}
              >
                {pvSymbols.length} / {pvExpectedLen} symbols ·{" "}
                {pv.bijective ? "values 1.." + pv.base : "values 0.." + (pv.base - 1)}
              </span>
            </label>

            <div className="rounded-xl border border-white/5 bg-ink-900/40 p-3 text-xs text-white/55">
              <p className="font-medium text-white/75">Try:</p>
              <button
                onClick={() => setBase(2, false)}
                className="mt-1 mr-2 inline-block rounded-full border border-white/10 px-2 py-0.5 hover:border-neon-cyan/60 hover:text-neon-cyan"
              >
                binary
              </button>
              <button
                onClick={() => setBase(16, false)}
                className="mt-1 mr-2 inline-block rounded-full border border-white/10 px-2 py-0.5 hover:border-neon-cyan/60 hover:text-neon-cyan"
              >
                hex
              </button>
              <button
                onClick={() => setBase(2, true)}
                className="mt-1 mr-2 inline-block rounded-full border border-white/10 px-2 py-0.5 hover:border-neon-violet/60 hover:text-neon-violet"
              >
                bij base 2
              </button>
              <button
                onClick={() => setBase(10, true)}
                className="mt-1 mr-2 inline-block rounded-full border border-white/10 px-2 py-0.5 hover:border-neon-violet/60 hover:text-neon-violet"
              >
                bij base 10
              </button>
              <button
                onClick={() => setBase(26, true)}
                className="mt-1 mr-2 inline-block rounded-full border border-white/10 px-2 py-0.5 hover:border-neon-violet/60 hover:text-neon-violet"
              >
                bij base 26
              </button>
            </div>
          </div>

          {pvValid ? (
            <PlaceValueEditor
              base={pv.base}
              symbols={pvSymbols}
              bijective={pv.bijective}
              customWeights={pv.customWeights}
              value={value}
              onChange={setValue}
            />
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-neon-magenta/30 p-8 text-sm text-neon-magenta">
              Provide exactly {pvExpectedLen} symbols to begin editing.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-strong rounded-3xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Custom digit alphabet
          </p>
          <label className="mt-4 block text-sm">
            <span className="text-white/60">Decimal value</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Math.trunc(Number(e.target.value) || 0))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 font-mono text-2xl"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-white/60">Base (positive 2..36 or negative ≤ −2)</span>
            <input
              type="number"
              value={config.base}
              onChange={(e) =>
                setConfig((c) => ({ ...c, base: Math.trunc(Number(e.target.value) || 0) }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2 font-mono text-lg"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-white/60">
              Digit symbols (any glyphs; need {expectedLen} of them)
            </span>
            <input
              type="text"
              value={config.symbols}
              onChange={(e) => setConfig((c) => ({ ...c, symbols: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 font-mono text-2xl tracking-widest"
              placeholder="🜁🜂🜃🜄…"
            />
            <span
              className={`mt-1 block text-xs ${
                valid ? "text-white/40" : "text-neon-magenta"
              }`}
            >
              {valid
                ? `${symbols.length} / ${expectedLen} symbols`
                : `need ${expectedLen} symbols — have ${symbols.length}`}
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              {value} in base {config.base} (custom)
            </p>
            <p className="mt-2 break-all font-mono text-2xl tracking-wide text-neon-cyan">
              {customRendering?.rendered ?? "—"}
            </p>
            <p className="mt-2 text-xs text-white/40">
              equivalent: <span className="font-mono">{customRendering?.raw}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Comparison title="Standard base 10" body={() => toStandardBase(value, 10).notation} />
          <Comparison title="Binary" body={() => toStandardBase(value, 2).notation} />
          <Comparison title="Hexadecimal" body={() => toStandardBase(value, 16).notation} />
          <Comparison title="Negabinary" body={() => toNegativeBase(value, -2).notation} />
          <Comparison title="Balanced ternary" body={() => toBalancedTernary(value).notation} />
          <Comparison title="Base φ (phinary)" body={() => toPhinary(value).notation} />
          <Comparison
            title="Bijective base 10"
            body={() => toBijective(value, 10).notation}
          />
          <Comparison
            title="Bijective base 26 (spreadsheet)"
            body={() => toBijective(value, 26).notation}
          />
          <Comparison
            title="Base −1+i (Gaussian)"
            body={() => toBaseMinusOnePlusI(value, 0).notation}
          />
        </div>
      </div>

      <p className="mt-12 text-sm text-white/40">
        Tip: try bijective base 26 to see why spreadsheets count{" "}
        <span className="font-mono">A, B, … Z, AA, AB, …</span> instead of{" "}
        <span className="font-mono">A, B, … Z, BA, BB, …</span>. With no zero
        digit, every column label is a unique number.
      </p>
    </div>
  );
}

function Comparison({ title, body }: { title: string; body: () => string }) {
  let value = "";
  let error = "";
  try {
    value = body();
  } catch (e) {
    error = e instanceof Error ? e.message : "error";
  }
  return (
    <div className="glass rounded-2xl p-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        {title}
      </p>
      <p
        className={`mt-1 break-all font-mono text-lg ${
          error ? "text-neon-magenta" : "text-white/90"
        }`}
      >
        {error || value || "—"}
      </p>
    </div>
  );
}
