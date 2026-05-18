import { SelfReference } from "@/components/SelfReference";

export default function GodelPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" /> Self-reference
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          A sentence about itself
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Some sentences describe themselves. <em>"This sentence has 32
          letters."</em> Is that true? Adjust N until the count matches. What
          you're doing is finding a <em>fixed point</em> — the very technique
          Gödel used to prove that every sufficiently rich logical system
          contains a true statement it can't prove.
        </p>
      </header>
      <SelfReference />
    </div>
  );
}
