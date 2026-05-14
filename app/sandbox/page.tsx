"use client";

import { useMemo, useState } from "react";
import { toStandardBase, toNegativeBase, toBalancedTernary, toPhinary } from "@/lib/bases";
import { toBaseMinusOnePlusI } from "@/lib/complex";

interface CustomBaseConfig {
  base: number;        // integer base (can be negative, |b| >= 2)
  symbols: string;     // ordered digit symbols (length must == |base|)
}

export default function SandboxPage() {
  const [value, setValue] = useState(42);
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
      // map glyph indices back to chosen symbols
      const glyphIndex = (g: string) =>
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(g);
      const rendered = result.digits.map((g) => symbols[glyphIndex(g)] ?? "?").join(" ");
      return { rendered, raw: result.notation };
    } catch (e) {
      return { rendered: "—", raw: e instanceof Error ? e.message : "error" };
    }
  }, [value, config.base, symbols, valid]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <span className="chip">Sandbox</span>
        <h1 className="mt-4 font-display text-4xl tracking-tight">
          What happens if…
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Invent your own digit alphabets. Switch to negative bases. Compare
          arcane systems side by side. Mathematics is not a list of rules —
          it's a sandbox.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
            title="Base −1+i (Gaussian)"
            body={() => toBaseMinusOnePlusI(value, 0).notation}
          />
        </div>
      </div>

      <p className="mt-12 text-sm text-white/40">
        Tip: try base 12 with symbols{" "}
        <span className="font-mono">0123456789↊↋</span> (the "dozenal" transdecimals),
        or base 16 with{" "}
        <span className="font-mono">⓪①②③④⑤⑥⑦⑧⑨ⓐⓑⓒⓓⓔⓕ</span>.
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
