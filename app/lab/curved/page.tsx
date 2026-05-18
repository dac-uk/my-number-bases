import { PoincareDisk } from "@/components/PoincareDisk";

export default function CurvedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-magenta" /> Non-Euclidean geometry
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Geometry without the parallel postulate
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          For two thousand years Euclid's fifth postulate looked obviously
          true. In the 19th century three different people realised it could
          be dropped — and that the resulting "hyperbolic" geometry, where
          triangles have angle sums less than 180°, was perfectly consistent.
        </p>
      </header>
      <PoincareDisk />
    </div>
  );
}
