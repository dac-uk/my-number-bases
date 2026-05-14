import { BaseConverter } from "@/components/BaseConverter";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <span className="chip">Base playground</span>
        <h1 className="mt-4 font-display text-4xl tracking-tight">Explore bases</h1>
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
