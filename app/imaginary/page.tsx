import { ImaginaryExplorer } from "@/components/ImaginaryExplorer";

export default function ImaginaryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-violet" /> Hero
        </span>
        <h1 className="mt-4 font-display text-4xl tracking-tight">
          The imaginary basis
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Multiplying by{" "}
          <span className="font-mono text-neon-cyan">i</span> is a 90° rotation
          in the plane. Scrub the slider and watch the cycle{" "}
          <span className="font-mono">1 → i → −1 → −i → 1</span> emerge.
        </p>
      </header>
      <ImaginaryExplorer />
    </div>
  );
}
