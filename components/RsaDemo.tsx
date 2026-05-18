"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SMALL_PRIMES = [
  11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
];

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Extended Euclidean algorithm — returns [g, x, y] such that a x + b y = g.
function egcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = egcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}

function modInverse(e: number, phi: number): number | null {
  const [g, x] = egcd(e, phi);
  if (g !== 1) return null;
  return ((x % phi) + phi) % phi;
}

// Modular exponentiation (a^e mod m) using safe BigInt arithmetic for the
// intermediate products, which can overflow JS numbers for n > ~3000.
function modPow(base: number, exp: number, mod: number): number {
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    e >>= 1n;
    b = (b * b) % m;
  }
  return Number(result);
}

export function RsaDemo() {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [e, setE] = useState(17);
  const [message, setMessage] = useState("HELLO");

  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const eValid = gcd(e, phi) === 1 && e > 1 && e < phi;
  const d = useMemo(() => (eValid ? modInverse(e, phi) : null), [e, phi, eValid]);

  // Suggest a valid e if the current one is invalid (so the demo "just works").
  const suggestedE = useMemo(() => {
    for (const candidate of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 65537]) {
      if (candidate > 1 && candidate < phi && gcd(candidate, phi) === 1) return candidate;
    }
    return 3;
  }, [phi]);

  const chars = Array.from(message.toUpperCase());
  // map each letter to its numeric value (A=1, B=2, ..., Z=26). Anything else
  // is just its character code mod n, so users see something they can decrypt.
  const encoded = chars.map((c) => {
    const code = c >= "A" && c <= "Z" ? c.charCodeAt(0) - 64 : c.charCodeAt(0) % n;
    return code;
  });
  const encrypted = encoded.map((m) => (m >= n ? null : modPow(m, e, n)));
  const decrypted = d == null ? null : encrypted.map((c) => (c == null ? null : modPow(c, d, n)));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 1 · pick two primes
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <PrimePicker label="p" value={p} onChange={setP} avoid={q} />
            <PrimePicker label="q" value={q} onChange={setQ} avoid={p} />
          </div>
          <p className="mt-4 font-mono text-sm text-white/65">
            n = p · q ={" "}
            <span className="text-neon-cyan">{n.toLocaleString("en")}</span>
            <span className="ml-4 text-white/45">
              φ(n) = (p−1)(q−1) ={" "}
              <span className="text-neon-violet">{phi.toLocaleString("en")}</span>
            </span>
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 2 · choose public exponent <span className="text-white/85">e</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={e}
              onChange={(ev) => setE(Math.max(2, Math.trunc(Number(ev.target.value) || 2)))}
              className="w-28 rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 font-mono text-lg text-neon-cyan"
            />
            <span className="text-xs text-white/55">
              must be coprime with φ(n) and 1 &lt; e &lt; φ(n)
            </span>
            {!eValid && (
              <button onClick={() => setE(suggestedE)} className="btn-ghost text-xs">
                fix → e = {suggestedE}
              </button>
            )}
          </div>
          <p className="mt-3 font-mono text-sm">
            d ≡ e⁻¹ (mod φ) ={" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={String(d)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={d != null ? "text-neon-violet" : "text-neon-magenta"}
              >
                {d != null ? d.toLocaleString("en") : "—"}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Step 3 · encrypt &amp; decrypt
          </p>
          <input
            type="text"
            value={message}
            onChange={(ev) => setMessage(ev.target.value.slice(0, 12))}
            className="mt-3 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 font-mono text-xl uppercase tracking-widest text-white"
            placeholder="HELLO"
          />
          <table className="mt-4 w-full font-mono text-xs">
            <thead>
              <tr className="text-white/40">
                <th className="text-left">letter</th>
                <th className="text-left">m</th>
                <th className="text-left">c = m^e mod n</th>
                <th className="text-left">m = c^d mod n</th>
              </tr>
            </thead>
            <tbody>
              {chars.map((c, i) => (
                <tr key={i} className="text-white/85">
                  <td className="py-1">{c}</td>
                  <td className="text-white/60">{encoded[i]}</td>
                  <td className="text-neon-cyan">
                    {encrypted[i] == null ? "—" : encrypted[i]}
                  </td>
                  <td className="text-neon-violet">
                    {decrypted?.[i] == null ? "—" : decrypted[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5 text-sm text-white/65">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan">
            why this works
          </p>
          <p className="mt-3 text-white/80">
            By Fermat–Euler, for any m coprime to n,{" "}
            <span className="font-mono">m^φ(n) ≡ 1 (mod n)</span>. Choose d so
            that <span className="font-mono">e · d ≡ 1 (mod φ(n))</span>;
            then <span className="font-mono">m^(ed) ≡ m (mod n)</span> and the
            decryption inverts the encryption.
          </p>
          <p className="mt-3 text-white/60">
            Real RSA uses primes hundreds of digits long. Here we use small
            ones so you can watch the maths — but the recipe is identical.
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-xs text-white/55">
          <p className="font-mono uppercase tracking-[0.18em] text-white/40">
            public / private
          </p>
          <p className="mt-2 font-mono text-white/85">
            public  = (n = {n}, e = {e})
            <br />
            private = (n = {n}, d = {d ?? "—"})
          </p>
          <p className="mt-3">
            Hand someone the public pair and they can encrypt. Only you, with
            d, can read what comes back.
          </p>
        </div>
      </aside>
    </div>
  );
}

function PrimePicker({
  label,
  value,
  onChange,
  avoid,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  avoid: number;
}) {
  return (
    <label className="flex flex-col text-xs text-white/55">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 rounded-lg border border-white/10 bg-ink-900/60 px-3 py-2 font-mono text-lg text-neon-cyan"
      >
        {SMALL_PRIMES.filter((n) => n !== avoid).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );
}
