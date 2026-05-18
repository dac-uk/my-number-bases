import { ModularClock } from "@/components/ModularClock";

export default function ModularPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-mint" /> Modular arithmetic
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Numbers that wrap
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Modular arithmetic asks: what's left after you go around as many times
          as you can? It is the natural setting for clocks, calendars, primes,
          cryptography, and the structure of every cyclic group.
        </p>
      </header>
      <ModularClock />
    </div>
  );
}
