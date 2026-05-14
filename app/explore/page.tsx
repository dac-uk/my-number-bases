import { BaseConverter } from "@/components/BaseConverter";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">Base playground</span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">Explore bases</h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Type a number, slide between bases. Every system below recomputes live —
          standard positive bases, negative bases, balanced ternary, and the
          golden ratio.
        </p>
      </header>
      <BaseConverter />
    </div>
  );
}
