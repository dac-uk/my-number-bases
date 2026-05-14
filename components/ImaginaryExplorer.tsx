"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArgandDiagram } from "@/components/ArgandDiagram";
import {
  iPower,
  cFormat,
  toBaseMinusOnePlusI,
  type Complex,
} from "@/lib/complex";

export function ImaginaryExplorer() {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now: number) => {
      const last = lastRef.current || now;
      const dt = (now - last) / 1000;
      lastRef.current = now;
      setK((prev) => {
        const next = prev + dt * 0.6;
        return next > 8 ? next - 8 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [playing]);

  const z = iPower(k);
  const integerK = Math.round(k) % 4;
  const cycle = ["1", "i", "−1", "−i"];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <ArgandDiagram k={k} aspect={1} />
        <div className="glass rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Powers of i form a cycle of length 4
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-2xl">
            {cycle.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <motion.span
                  animate={{
                    color: integerK === i ? "#7df9ff" : "rgba(255,255,255,0.5)",
                    scale: integerK === i ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="px-2"
                >
                  {v}
                </motion.span>
                {i < cycle.length - 1 && (
                  <span className="text-white/30">→</span>
                )}
              </div>
            ))}
            <span className="text-white/30">→ …</span>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass-strong rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Slider — the exponent k
          </p>
          <input
            type="range"
            min={0}
            max={8}
            step={0.01}
            value={k}
            onChange={(e) => {
              setPlaying(false);
              setK(Number(e.target.value));
            }}
            className="mt-4 w-full accent-neon-cyan"
          />
          <div className="mt-2 flex justify-between font-mono text-xs text-white/50">
            <span>0</span>
            <span className="text-neon-cyan">i^{k.toFixed(2)}</span>
            <span>8</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/5 bg-ink-900/40 p-3">
              <p className="text-xs text-white/40">value</p>
              <p className="font-mono text-base text-neon-cyan">{cFormat(z, 3)}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-900/40 p-3">
              <p className="text-xs text-white/40">angle</p>
              <p className="font-mono text-base text-neon-violet">
                {((k * 90) % 360).toFixed(1)}°
              </p>
            </div>
          </div>

          <button
            onClick={() => setPlaying((p) => !p)}
            className="mt-5 w-full rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-neon-cyan/60 hover:text-neon-cyan"
          >
            {playing ? "Pause animation" : "Resume animation"}
          </button>
        </div>

        <BaseMinusOnePlusICard />
      </aside>
    </div>
  );
}

function BaseMinusOnePlusICard() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const result = useMemo(() => toBaseMinusOnePlusI(a, b), [a, b]);

  const trailPoints: { z: Complex; tint: string }[] = result.trail.map((p, i) => ({
    z: p,
    tint: i === result.trail.length - 1 ? "#ff5fa2" : "#b388ff",
  }));

  return (
    <div className="glass-strong rounded-2xl p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        Base −1+i (Knuth–Penney)
      </p>
      <p className="mt-2 text-sm text-white/60">
        Every Gaussian integer has a finite representation using just the
        digits {"{0, 1}"}.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-white/40">real (a)</span>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Math.trunc(Number(e.target.value) || 0))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 font-mono text-lg"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/40">imag (b)</span>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Math.trunc(Number(e.target.value) || 0))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 font-mono text-lg"
          />
        </label>
      </div>
      <div className="mt-4 rounded-xl border border-white/5 bg-ink-900/40 p-3">
        <p className="text-xs text-white/40">
          {a}
          {b >= 0 ? "+" : ""}
          {b}i in base −1+i
        </p>
        <p className="mt-1 break-all font-mono text-xl text-neon-magenta">
          {result.notation}
        </p>
      </div>
      <div className="mt-4">
        <ArgandDiagram k={0} points={trailPoints} showTrail={false} aspect={1.6} />
      </div>
    </div>
  );
}
