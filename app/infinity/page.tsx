import { HilbertHotel } from "@/components/HilbertHotel";
import { CantorDiagonal } from "@/components/CantorDiagonal";
import { GeometricSeries } from "@/components/GeometricSeries";
import { KochFractal } from "@/components/KochFractal";
import { ContinuedFraction } from "@/components/ContinuedFraction";

export default function InfinityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 sm:mb-12">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-magenta" /> Infinity
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-5xl">
          A short tour of ∞
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Infinity isn't a single thing — it's a family of careful definitions
          that mathematicians have built so the word stops being a hand-wave.
          Five rooms below; each one bends a different intuition.
        </p>
      </header>

      <Section
        tag="01 · countable infinity"
        title="Hilbert's Hotel"
        kicker="A fully-booked hotel with infinitely many rooms always has space for one more — or for a whole bus of one more."
      >
        <HilbertHotel />
      </Section>

      <Section
        tag="02 · uncountable infinity"
        title="Cantor's diagonal argument"
        kicker="Not all infinities are the same size. The real numbers strictly outnumber the integers, and the proof fits on one diagonal."
      >
        <CantorDiagonal />
      </Section>

      <Section
        tag="03 · convergent series"
        title="An infinite sum that fits in a square"
        kicker="Cut a square in half, then a half of what's left, then a half of what's left… Add forever; the result is exactly one."
      >
        <GeometricSeries />
      </Section>

      <Section
        tag="04 · fractal infinity"
        title="A border that never stops growing"
        kicker="Increase the iterations and watch the Koch snowflake's perimeter explode while its area stays bounded — infinity inside a finite frame."
      >
        <KochFractal />
      </Section>

      <Section
        tag="05 · infinite expansion"
        title="Continued fractions"
        kicker="Some numbers — like φ, e, √2 — have a more honest name than any decimal: they are infinite nested fractions that close in on the truth."
      >
        <ContinuedFraction />
      </Section>

      <div className="mt-20 glass-strong rounded-3xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          aside · the hierarchy
        </p>
        <p className="mt-3 font-display text-2xl leading-snug text-white/90">
          ℵ₀ &nbsp;<span className="text-white/30">&lt;</span>&nbsp; 𝔠 &nbsp;
          <span className="text-white/30">&lt;</span>&nbsp; 2<sup>𝔠</sup> &nbsp;
          <span className="text-white/30">&lt;</span>&nbsp; …
        </p>
        <p className="mt-4 max-w-3xl text-sm text-white/60">
          ℵ₀ is the size of the natural numbers. 𝔠 is the size of the real
          number line. Cantor showed there is always a bigger infinity — take
          the power set of any set and you've got one. Mathematics has, in a
          very precise sense, an unending tower of infinities.
        </p>
      </div>
    </div>
  );
}

function Section({
  tag,
  title,
  kicker,
  children,
}: {
  tag: string;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16 sm:mb-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        {tag}
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-white/60">{kicker}</p>
      <div className="mt-6 sm:mt-8">{children}</div>
    </section>
  );
}
