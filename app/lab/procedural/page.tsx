import { Lsystem } from "@/components/Lsystem";

export default function ProceduralPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-mint" /> Procedural generation
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          A grammar that grows
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          An L-system is a tiny grammar over a tiny alphabet. Iterate the
          rules, hand the resulting string to a turtle, and intricate
          self-similar shapes — fern leaves, snowflakes, dragon curves —
          emerge from a few replacement rules. Same idea drives modern
          procedural-content engines, just with more wiring.
        </p>
      </header>
      <Lsystem />
    </div>
  );
}
