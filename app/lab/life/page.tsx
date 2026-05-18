import { Life } from "@/components/Life";

export default function LifePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" /> Cellular automata
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Conway's Game of Life
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          A grid. Each cell is alive or dead. Each tick, four rules decide
          which cells live, die, or are born. With no further instructions you
          get gliders, pulsars, and — provably — a Turing-complete computer.
        </p>
      </header>
      <Life />
    </div>
  );
}
