import { RsaDemo } from "@/components/RsaDemo";

export default function RsaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-violet" /> Cryptography
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
          Prime numbers, made useful
        </h1>
        <p className="mt-3 max-w-2xl text-white/65">
          The asymmetry between multiplying two primes (easy) and factoring
          their product back (hard) is what keeps your bank logins private.
          Walk the whole RSA recipe with small numbers, then imagine each one
          with 600 digits.
        </p>
      </header>
      <RsaDemo />
    </div>
  );
}
