import Link from "next/link";

interface Toy {
  slug: string;
  tag: string;
  title: string;
  body: string;
  tint: "cyan" | "violet" | "magenta" | "gold" | "mint";
}

const TOYS: Toy[] = [
  {
    slug: "life",
    tag: "01 · cellular automata",
    title: "Conway's Game of Life",
    body: "Click to draw cells. Press play and watch four-line rules build gliders, oscillators, and accidental computers.",
    tint: "cyan",
  },
  {
    slug: "rsa",
    tag: "02 · cryptography",
    title: "Prime numbers · RSA",
    body: "Pick two primes, derive a public key, and watch the same maths protect a message and unwrap it again.",
    tint: "violet",
  },
  {
    slug: "modular",
    tag: "03 · modular arithmetic",
    title: "Clock arithmetic",
    body: "Numbers that wrap. Draw addition on a clock face, then a full multiplication table — find the surprising symmetries.",
    tint: "mint",
  },
  {
    slug: "surreal",
    tag: "04 · surreal numbers",
    title: "Stern–Brocot tree",
    body: "Every positive rational appears exactly once. Walk left/right through a binary tree and watch fractions emerge.",
    tint: "gold",
  },
  {
    slug: "curved",
    tag: "05 · non-Euclidean geometry",
    title: "Hyperbolic plane",
    body: "Drag three points on the Poincaré disk. Lines are arcs, triangles have angle-sums less than 180°.",
    tint: "magenta",
  },
  {
    slug: "godel",
    tag: "06 · self-reference",
    title: "Sentences that count themselves",
    body: "Find an N such that 'This sentence has N letters' is, in fact, true. A first taste of Gödel's fixed-point trick.",
    tint: "cyan",
  },
  {
    slug: "procedural",
    tag: "07 · procedural generation",
    title: "Grammar of plants",
    body: "An L-system: replace a symbol with a string, repeat, then have a turtle draw the result. Trees and fractals emerge from a few characters.",
    tint: "mint",
  },
];

export default function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 sm:mb-12">
        <span className="chip">Lab</span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-5xl">
          A small lab of mathematical toys
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Seven self-contained interactives, each chosen because the underlying
          idea is too beautiful to read about silently. Click around, break
          them, see what happens.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOYS.map((t) => (
          <ToyCard key={t.slug} toy={t} />
        ))}
      </div>
    </div>
  );
}

function ToyCard({ toy }: { toy: Toy }) {
  const ring: Record<string, string> = {
    cyan: "hover:border-neon-cyan/50 hover:shadow-glow",
    violet: "hover:border-neon-violet/50 hover:shadow-glowViolet",
    magenta: "hover:border-neon-magenta/50",
    gold: "hover:border-neon-gold/50",
    mint: "hover:border-neon-mint/50",
  };
  const txt: Record<string, string> = {
    cyan: "text-neon-cyan",
    violet: "text-neon-violet",
    magenta: "text-neon-magenta",
    gold: "text-neon-gold",
    mint: "text-neon-mint",
  };
  return (
    <Link
      href={`/lab/${toy.slug}`}
      className={`group glass relative flex flex-col rounded-2xl p-6 transition ${ring[toy.tint]}`}
    >
      <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${txt[toy.tint]}`}>
        {toy.tag}
      </p>
      <h2 className="mt-3 font-display text-xl tracking-tight">{toy.title}</h2>
      <p className="mt-3 flex-1 text-sm text-white/65">{toy.body}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm text-white/55 group-hover:text-white">
        Open <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
