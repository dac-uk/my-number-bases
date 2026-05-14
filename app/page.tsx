import Link from "next/link";
import { HeroArgand } from "@/components/HeroArgand";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pt-20">
      <section className="grid items-center gap-10 sm:grid-cols-2 sm:gap-16">
        <div>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" /> v0.1 — interactive
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Numbers are <em className="not-italic text-neon-cyan">stranger</em> than you think.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
            An interactive playground for unusual number systems. Convert across
            bases, watch imaginary numbers orbit the complex plane, and discover
            the geometry hiding inside arithmetic.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-primary">Explore bases →</Link>
            <Link href="/imaginary" className="btn-ghost">Try imaginary numbers</Link>
            <Link href="/patterns" className="btn-ghost">Visualise patterns</Link>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-white/40">Bases supported</dt>
              <dd className="mt-1 font-mono text-xl">2 – 36, −2, φ, i</dd>
            </div>
            <div>
              <dt className="text-white/40">Style</dt>
              <dd className="mt-1 font-mono text-xl">live · visual</dd>
            </div>
            <div>
              <dt className="text-white/40">Best for</dt>
              <dd className="mt-1 font-mono text-xl">curious minds</dd>
            </div>
          </dl>
        </div>
        <HeroArgand />
      </section>

      <section className="mt-28">
        <h2 className="font-display text-3xl tracking-tight">Four ways in</h2>
        <p className="mt-2 max-w-xl text-white/60">
          Each room is a different lens onto the same question — what is a
          number, really?
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            href="/explore"
            tag="Converter"
            title="Base playground"
            body="Type any number, slide between bases 2–36 and beyond. Watch the digits rearrange themselves."
            tint="cyan"
          />
          <FeatureCard
            href="/imaginary"
            tag="Hero"
            title="Imaginary basis"
            body="Scrub through powers of i and watch numbers spin around the complex plane."
            tint="violet"
          />
          <FeatureCard
            href="/patterns"
            tag="Gallery"
            title="Pattern visualiser"
            body="Modular art, multiplication circles, binary mosaics — change the base, watch the pattern breathe."
            tint="magenta"
          />
          <FeatureCard
            href="/sandbox"
            tag="Sandbox"
            title="What happens if…"
            body="Invent your own bases. Try negative, fractional, or imaginary. Break things on purpose."
            tint="gold"
          />
        </div>
      </section>

      <section className="mt-28 grid items-center gap-10 sm:grid-cols-[1.1fr_1fr]">
        <div className="glass rounded-3xl p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            Philosophy
          </p>
          <p className="mt-4 font-display text-2xl leading-snug text-white/90">
            Mathematics is not merely calculation. It is structure, symmetry,
            abstraction, imagination, and beauty.
          </p>
          <p className="mt-6 text-sm text-white/60">
            We built this because the moment a student sees that{" "}
            <span className="font-mono text-neon-cyan">i² = −1</span> draws a
            quarter-turn in the plane, something irreversible happens. We want
            more of those moments.
          </p>
        </div>
        <div className="space-y-4">
          <Quote line="binary" detail="Every digit is on or off." />
          <Quote line="balanced ternary" detail="Digits {−, 0, +} — Knuth's favourite." />
          <Quote line="base −1+i" detail="No sign needed. Numbers spiral in." />
          <Quote line="base φ" detail="An irrational base. Fractal arithmetic." />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  tag,
  title,
  body,
  tint,
}: {
  href: string;
  tag: string;
  title: string;
  body: string;
  tint: "cyan" | "violet" | "magenta" | "gold";
}) {
  const ring: Record<string, string> = {
    cyan: "hover:border-neon-cyan/50 hover:shadow-glow",
    violet: "hover:border-neon-violet/50 hover:shadow-glowViolet",
    magenta: "hover:border-neon-magenta/50",
    gold: "hover:border-neon-gold/50",
  };
  return (
    <Link
      href={href}
      className={`group glass relative flex flex-col rounded-2xl p-6 transition ${ring[tint]}`}
    >
      <span className="chip w-fit">{tag}</span>
      <h3 className="mt-4 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-white/60">{body}</p>
      <span className="mt-6 inline-flex items-center gap-1 text-sm text-white/50 group-hover:text-white">
        Open <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function Quote({ line, detail }: { line: string; detail: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="font-mono text-base text-neon-cyan">{line}</p>
      <p className="mt-1 text-sm text-white/55">{detail}</p>
    </div>
  );
}
