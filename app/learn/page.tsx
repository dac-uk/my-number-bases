import Link from "next/link";

interface Lesson {
  slug: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
}

const LESSONS: Lesson[] = [
  {
    slug: "what-is-a-base",
    tag: "01 · foundations",
    title: "What is a base, really?",
    body:
      "A base is just a way of saying: each column is worth this many times the one to its right. Choose the multiplier, and you've chosen the base. Decimal is the choice of 10. It's a habit, not a law.",
  },
  {
    slug: "why-base-10-is-arbitrary",
    tag: "02 · history",
    title: "Why base 10 is arbitrary",
    body:
      "We have ten fingers. That's it. The Babylonians used base 60. Mayans used base 20. Most early computers preferred 8 or 16. Nothing about the number ten is special — except us.",
  },
  {
    slug: "binary",
    tag: "03 · binary",
    title: "Binary — the language of off and on",
    body:
      "Drop everything but two states. Every number becomes a sequence of on/off decisions. The universe of computing rests on this single move.",
    href: "/explore",
  },
  {
    slug: "balanced-ternary",
    tag: "04 · balanced ternary",
    title: "Balanced ternary",
    body:
      "Digits {−, 0, +}. Negative numbers need no sign. Donald Knuth called it 'perhaps the prettiest number system of all'. Surprisingly close to optimal for digital storage.",
    href: "/explore",
  },
  {
    slug: "imaginary",
    tag: "05 · imaginary numbers",
    title: "Multiplying by i is a rotation",
    body:
      "Once you see that i² = −1 means 'two quarter-turns equals a half-turn', complex numbers stop being mysterious. They are the algebra of plane rotations.",
    href: "/imaginary",
  },
  {
    slug: "complex-bases",
    tag: "06 · imaginary bases",
    title: "Numbers that live on a plane",
    body:
      "Use −1+i as your base and digits {0, 1}, and every Gaussian integer gets a unique finite representation. The number line becomes a fractal lattice.",
    href: "/imaginary",
  },
  {
    slug: "irrational-bases",
    tag: "07 · irrational bases",
    title: "Base φ — irrationality on purpose",
    body:
      "What if the base itself were the golden ratio? Then 100 = 011 (because φ² = φ + 1). Arithmetic becomes a study of Fibonacci shadows.",
    href: "/explore",
  },
  {
    slug: "infinity",
    tag: "08 · infinity",
    title: "Not all infinities are equal",
    body:
      "ℵ₀ is the size of the natural numbers. 𝔠 is the size of the real line. Cantor's diagonal argument shows 𝔠 is strictly larger — and there is always a bigger one above it.",
    href: "/infinity",
  },
  {
    slug: "bijective",
    tag: "09 · bijective bases",
    title: "The bases without zero",
    body:
      "Drop the digit 0 and let digit values run 1..k. Now every string of digits names exactly one positive integer — and the empty string is the only name for zero. Spreadsheet columns are bijective base 26: A, B, … Z, AA, AB.",
    href: "/sandbox",
  },
  {
    slug: "patterns",
    tag: "10 · pattern",
    title: "From arithmetic to art",
    body:
      "Plot (x·y) mod n on a grid. Connect every i to (i·k) mod n on a circle. Numbers, drawn carefully, become structure — and the structure was there all along.",
    href: "/patterns",
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">Learn</span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Eight short ideas
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Each card is a small door. Open one and try the related interactive —
          predict what happens first, then check.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lesson) => (
          <article
            key={lesson.slug}
            className="glass group flex flex-col rounded-2xl p-6 transition hover:border-neon-cyan/40"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              {lesson.tag}
            </p>
            <h2 className="mt-3 font-display text-xl tracking-tight">
              {lesson.title}
            </h2>
            <p className="mt-3 flex-1 text-sm text-white/65">{lesson.body}</p>
            {lesson.href && (
              <Link
                href={lesson.href}
                className="mt-5 inline-flex items-center gap-1 text-sm text-neon-cyan"
              >
                Try the interactive <span aria-hidden>→</span>
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
