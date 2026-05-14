// Core base-conversion engine.
//
// Supports:
//   - Standard positive integer bases 2..36
//   - Negative integer bases (e.g. base -2)
//   - Balanced ternary (digits {-1, 0, +1})
//   - Phinary / golden-ratio base φ
//
// Returns digit arrays so the UI can render each digit, its weight, and
// step-by-step decomposition.

export type DigitGlyph = string; // single visual symbol

export interface ConversionStep {
  remaining: string;   // the value left to process (display string)
  digit: DigitGlyph;   // digit chosen this step
  weight: string;      // human-readable weight, e.g. "× 2^3"
}

export interface ConversionResult {
  digits: DigitGlyph[];        // most-significant first
  fractionalDigits?: DigitGlyph[];
  steps: ConversionStep[];
  notation: string;            // assembled string e.g. "10110.01"
  baseLabel: string;
}

const GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function digitFor(value: number): DigitGlyph {
  if (value < 0 || value >= GLYPHS.length) {
    throw new Error(`Digit value out of range: ${value}`);
  }
  return GLYPHS[value];
}

function glyphToValue(g: string): number {
  const v = GLYPHS.indexOf(g.toUpperCase());
  if (v < 0) throw new Error(`Unknown digit: ${g}`);
  return v;
}

// --- standard positive integer base 2..36 -----------------------------------

export function toStandardBase(n: number, base: number): ConversionResult {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new Error("Standard base must be an integer between 2 and 36");
  }
  if (!Number.isFinite(n)) throw new Error("Not a finite number");

  const negative = n < 0;
  let x = Math.abs(Math.trunc(n));
  const frac = Math.abs(n) - x;

  const digits: DigitGlyph[] = [];
  const steps: ConversionStep[] = [];
  let power = 0;

  if (x === 0) {
    digits.push("0");
    steps.push({ remaining: "0", digit: "0", weight: `× ${base}^0` });
  } else {
    while (x > 0) {
      const r = x % base;
      digits.unshift(digitFor(r));
      steps.push({
        remaining: x.toString(),
        digit: digitFor(r),
        weight: `× ${base}^${power}`,
      });
      x = Math.floor(x / base);
      power += 1;
    }
  }

  let fractionalDigits: DigitGlyph[] | undefined;
  if (frac > 0) {
    fractionalDigits = [];
    let f = frac;
    for (let i = 0; i < 12 && f > 0; i += 1) {
      f *= base;
      const d = Math.floor(f);
      fractionalDigits.push(digitFor(d));
      f -= d;
    }
  }

  const notation =
    (negative ? "-" : "") +
    digits.join("") +
    (fractionalDigits && fractionalDigits.length ? "." + fractionalDigits.join("") : "");

  return {
    digits,
    fractionalDigits,
    steps,
    notation,
    baseLabel: `base ${base}`,
  };
}

export function parseStandardBase(text: string, base: number): number {
  if (base < 2 || base > 36) throw new Error("Base out of range");
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const sign = trimmed.startsWith("-") ? -1 : 1;
  const body = trimmed.replace(/^[-+]/, "");
  const [intPart, fracPart = ""] = body.split(".");
  let value = 0;
  for (const ch of intPart) value = value * base + glyphToValue(ch);
  if (fracPart) {
    let f = 0;
    let weight = 1 / base;
    for (const ch of fracPart) {
      f += glyphToValue(ch) * weight;
      weight /= base;
    }
    value += f;
  }
  return sign * value;
}

// --- negative base ----------------------------------------------------------

export function toNegativeBase(n: number, base: number): ConversionResult {
  if (!Number.isInteger(base) || base > -2) {
    throw new Error("Negative base must be an integer ≤ -2");
  }
  let x = Math.trunc(n);
  const digits: DigitGlyph[] = [];
  const steps: ConversionStep[] = [];
  let power = 0;
  if (x === 0) digits.push("0");
  while (x !== 0) {
    let r = x % base;
    let q = Math.trunc(x / base);
    if (r < 0) {
      r += Math.abs(base);
      q += 1;
    }
    digits.unshift(digitFor(r));
    steps.push({
      remaining: x.toString(),
      digit: digitFor(r),
      weight: `× (${base})^${power}`,
    });
    x = q;
    power += 1;
  }
  return {
    digits,
    steps,
    notation: digits.join(""),
    baseLabel: `base ${base}`,
  };
}

// --- balanced ternary -------------------------------------------------------

export function toBalancedTernary(n: number): ConversionResult {
  let x = Math.trunc(n);
  const digits: DigitGlyph[] = [];
  const steps: ConversionStep[] = [];
  let power = 0;
  if (x === 0) digits.push("0");
  while (x !== 0) {
    let r = ((x % 3) + 3) % 3;
    let q = Math.trunc((x - r) / 3);
    let glyph: DigitGlyph;
    if (r === 0) glyph = "0";
    else if (r === 1) glyph = "+";
    else {
      glyph = "−"; // U+2212 minus
      q += 1;
    }
    digits.unshift(glyph);
    steps.push({
      remaining: x.toString(),
      digit: glyph,
      weight: `× 3^${power}`,
    });
    x = q;
    power += 1;
  }
  return {
    digits,
    steps,
    notation: digits.join(""),
    baseLabel: "balanced ternary",
  };
}

// --- golden-ratio (phinary) base φ ------------------------------------------
//
// Greedy algorithm: at each step pick the largest power of φ ≤ remaining value.

const PHI = (1 + Math.sqrt(5)) / 2;

export function toPhinary(n: number): ConversionResult {
  let x = n;
  const steps: ConversionStep[] = [];
  // find the highest power of φ ≤ |x|
  if (x === 0) {
    return {
      digits: ["0"],
      steps: [{ remaining: "0", digit: "0", weight: "× φ^0" }],
      notation: "0",
      baseLabel: "phinary (base φ)",
    };
  }
  let highest = 0;
  while (Math.pow(PHI, highest + 1) <= Math.abs(x)) highest += 1;
  let lowest = 0;
  // simple bound: 12 fractional digits
  const intDigits: DigitGlyph[] = [];
  const fracDigits: DigitGlyph[] = [];
  for (let p = highest; p >= lowest && p > -12; p -= 1) {
    const weight = Math.pow(PHI, p);
    if (Math.abs(x) >= weight - 1e-12) {
      x = x - weight;
      const glyph: DigitGlyph = "1";
      if (p >= 0) intDigits.push(glyph);
      else fracDigits.push(glyph);
      steps.push({
        remaining: (x + weight).toFixed(6),
        digit: "1",
        weight: `× φ^${p}`,
      });
    } else {
      if (p >= 0) intDigits.push("0");
      else fracDigits.push("0");
    }
    if (Math.abs(x) < 1e-10) {
      // pad remaining integer digits with zeros if we've already finished
      if (p > 0) {
        for (let q = p - 1; q >= 0; q -= 1) intDigits.push("0");
      }
      break;
    }
  }
  const notation =
    (intDigits.length ? intDigits.join("") : "0") +
    (fracDigits.length ? "." + fracDigits.join("") : "");
  return {
    digits: intDigits,
    fractionalDigits: fracDigits.length ? fracDigits : undefined,
    steps,
    notation,
    baseLabel: "phinary (base φ)",
  };
}

// --- bijective bases --------------------------------------------------------
//
// In a bijective base k the digit set is {1, 2, … , k} (no zero).  Every
// positive integer has a unique representation, the empty string represents
// 0, and there is no leading-zero ambiguity.  Bijective base 26 produces the
// "spreadsheet column" sequence A, B, … Z, AA, AB, … ZZ, AAA …

// Default symbol sets indexed by base.  Symbol at index i is for digit value
// (i + 1).
const DEFAULT_BIJECTIVE_SYMBOLS: Record<number, string> = {
  2:  "12",
  3:  "123",
  4:  "1234",
  5:  "12345",
  6:  "123456",
  7:  "1234567",
  8:  "12345678",
  9:  "123456789",
  10: "123456789A",
  16: "123456789ABCDEFG",
  26: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};

export function bijectiveSymbols(k: number): string {
  if (DEFAULT_BIJECTIVE_SYMBOLS[k]) return DEFAULT_BIJECTIVE_SYMBOLS[k];
  // fall back to GLYPHS[1..k] (so digit 1 = '1', …, digit 10 = 'A', etc.)
  let s = "";
  for (let i = 1; i <= k; i += 1) s += GLYPHS[i % GLYPHS.length];
  return s;
}

export function toBijective(
  n: number,
  k: number,
  symbols: string = bijectiveSymbols(k),
): ConversionResult {
  if (!Number.isInteger(k) || k < 1) {
    throw new Error("Bijective base must be a positive integer");
  }
  const syms = Array.from(symbols);
  if (syms.length < k) {
    throw new Error(`Bijective base ${k} needs ${k} symbols`);
  }
  let x = Math.trunc(Math.abs(n));
  const negative = n < 0;
  const digits: DigitGlyph[] = [];
  const steps: ConversionStep[] = [];
  let power = 0;
  if (x === 0) {
    return {
      digits: ["∅"],
      steps: [{ remaining: "0", digit: "∅", weight: "—" }],
      notation: "∅",
      baseLabel: `bijective base ${k}`,
    };
  }
  while (x > 0) {
    const r = (x - 1) % k;     // 0 .. k-1
    const digitVal = r + 1;    // 1 .. k
    digits.unshift(syms[r]);
    steps.push({
      remaining: x.toString(),
      digit: syms[r],
      weight: `× ${k}^${power}`,
    });
    x = (x - digitVal) / k;
    power += 1;
  }
  return {
    digits,
    steps,
    notation: (negative ? "−" : "") + digits.join(""),
    baseLabel: `bijective base ${k}`,
  };
}

export function parseBijective(
  text: string,
  k: number,
  symbols: string = bijectiveSymbols(k),
): number {
  const syms = Array.from(symbols);
  const trimmed = text.trim();
  if (!trimmed || trimmed === "∅") return 0;
  let value = 0;
  for (const ch of Array.from(trimmed)) {
    const v = syms.indexOf(ch);
    if (v < 0) throw new Error(`Unknown bijective digit: ${ch}`);
    value = value * k + (v + 1);
  }
  return value;
}

// --- registry ---------------------------------------------------------------

export interface BaseSystem {
  id: string;
  label: string;
  description: string;
  convert: (n: number) => ConversionResult;
  category: "standard" | "negative" | "balanced" | "irrational" | "bijective";
}

export const SYSTEMS: BaseSystem[] = [
  { id: "b2",  label: "Binary (base 2)",      description: "Powers of 2 — every digit is on or off.", category: "standard", convert: (n) => toStandardBase(n, 2) },
  { id: "b3",  label: "Ternary (base 3)",     description: "Three states per digit.",                  category: "standard", convert: (n) => toStandardBase(n, 3) },
  { id: "b8",  label: "Octal (base 8)",       description: "Old systems-programming favourite.",        category: "standard", convert: (n) => toStandardBase(n, 8) },
  { id: "b10", label: "Decimal (base 10)",    description: "Ten fingers. Surprisingly arbitrary.",      category: "standard", convert: (n) => toStandardBase(n, 10) },
  { id: "b12", label: "Dozenal (base 12)",    description: "Twelve has more divisors than ten.",        category: "standard", convert: (n) => toStandardBase(n, 12) },
  { id: "b16", label: "Hexadecimal (base 16)",description: "Two hex digits = one byte.",                category: "standard", convert: (n) => toStandardBase(n, 16) },
  { id: "b36", label: "Base 36",              description: "Every alphanumeric digit used.",            category: "standard", convert: (n) => toStandardBase(n, 36) },
  { id: "bn2", label: "Negabinary (base −2)", description: "No sign needed — negatives encode naturally.", category: "negative", convert: (n) => toNegativeBase(n, -2) },
  { id: "bn3", label: "Base −3",              description: "Another negative base.",                    category: "negative", convert: (n) => toNegativeBase(n, -3) },
  { id: "bt3", label: "Balanced ternary",      description: "Digits {−, 0, +}. Donald Knuth's favourite.",category: "balanced", convert: (n) => toBalancedTernary(n) },
  { id: "phi", label: "Phinary (base φ)",     description: "Base golden ratio. Irrational, fractal.",   category: "irrational", convert: (n) => toPhinary(n) },
  { id: "bij2",  label: "Bijective base 2",   description: "Digits {1, 2}. No zero — every string is a unique number.", category: "bijective", convert: (n) => toBijective(n, 2) },
  { id: "bij10", label: "Bijective base 10",  description: "Digits 1–9 and A for ten. No zero ever appears.",           category: "bijective", convert: (n) => toBijective(n, 10) },
  { id: "bij26", label: "Bijective base 26",  description: "Spreadsheet columns: A, B, … Z, AA, AB, …",                 category: "bijective", convert: (n) => toBijective(n, 26) },
];

export function systemById(id: string): BaseSystem | undefined {
  return SYSTEMS.find((s) => s.id === id);
}
