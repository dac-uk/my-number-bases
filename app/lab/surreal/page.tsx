import { SternBrocot } from "@/components/SternBrocot";

export default function SurrealPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-gold" /> Surreal numbers
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Building numbers from sets
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Conway built every number — integers, rationals, reals, transfinite
          ordinals, infinitesimals — by repeatedly inserting a value between
          two others. The Stern–Brocot tree shows the same idea on rationals:
          every fraction in lowest terms appears <em>exactly once</em>.
        </p>
      </header>
      <SternBrocot />
    </div>
  );
}
