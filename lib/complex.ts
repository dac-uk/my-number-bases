// Complex-number primitives + complex-base conversion.
//
// The headline feature is base −1+i with digit set {0, 1} (Knuth–Penney),
// which gives a finite representation for every Gaussian integer.

export interface Complex {
  re: number;
  im: number;
}

export function c(re: number, im = 0): Complex {
  return { re, im };
}

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cScale(a: Complex, k: number): Complex {
  return { re: a.re * k, im: a.im * k };
}

export function cMag(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function cArg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function cFormat(a: Complex, digits = 3): string {
  const r = round(a.re, digits);
  const i = round(a.im, digits);
  if (i === 0) return `${r}`;
  if (r === 0) return `${i}i`;
  return `${r}${i > 0 ? "+" : ""}${i}i`;
}

function round(x: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(x * p) / p;
}

// --- powers of i ------------------------------------------------------------

// Continuous power of i: i^k = e^(iπk/2)
export function iPower(k: number): Complex {
  const theta = (Math.PI / 2) * k;
  return { re: Math.cos(theta), im: Math.sin(theta) };
}

// --- base −1+i conversion (Knuth–Penney) ------------------------------------

export interface ComplexConversionStep {
  z: Complex;
  digit: 0 | 1;
}

export interface ComplexConversionResult {
  digits: (0 | 1)[];          // most-significant first
  steps: ComplexConversionStep[];
  notation: string;
  trail: Complex[];           // cumulative partial sums for visualisation
}

export function toBaseMinusOnePlusI(a: number, b: number): ComplexConversionResult {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Inputs must be Gaussian integers (real & imag both integer)");
  }
  let ra = a;
  let rb = b;
  const digits: (0 | 1)[] = [];
  const steps: ComplexConversionStep[] = [];
  let guard = 0;
  if (ra === 0 && rb === 0) digits.push(0);
  while ((ra !== 0 || rb !== 0) && guard < 1024) {
    const d = (((ra + rb) % 2) + 2) % 2 as 0 | 1;
    steps.push({ z: { re: ra, im: rb }, digit: d });
    const na = (rb - ra + d) / 2;
    const nb = (-ra + d - rb) / 2;
    digits.unshift(d);
    ra = na;
    rb = nb;
    guard += 1;
  }
  // build trail of partial values for visualisation
  const base: Complex = { re: -1, im: 1 };
  const trail: Complex[] = [];
  let acc: Complex = { re: 0, im: 0 };
  for (const d of digits) {
    acc = cAdd(cMul(acc, base), { re: d, im: 0 });
    trail.push(acc);
  }
  return {
    digits,
    steps,
    notation: digits.join("") || "0",
    trail,
  };
}

// Evaluate a digit string in an arbitrary complex base.
export function evalComplexBase(digits: number[], base: Complex): Complex {
  let acc: Complex = { re: 0, im: 0 };
  for (const d of digits) {
    acc = cAdd(cMul(acc, base), { re: d, im: 0 });
  }
  return acc;
}
