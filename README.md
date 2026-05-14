# My Number Bases

An interactive playground for unusual number systems — convert across
standard, negative, balanced, irrational, and complex bases, then watch
patterns emerge.

> "Numbers are stranger than you think."

## Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Framer Motion
- Zustand (lightweight state)
- mathjs (numerical helpers)
- Canvas + requestAnimationFrame for visualisations

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Layout

- `app/` — pages: landing, explore, imaginary, patterns, sandbox, learn
- `components/` — UI: nav, converter, Argand diagram, patterns canvas
- `lib/bases.ts` — conversion engine for bases 2-36, negative, balanced, phi
- `lib/complex.ts` — complex arithmetic + base −1+i (Knuth–Penney)

## Roadmap

- WebGPU/Three.js Argand surface
- Custom-base arithmetic operators
- Shareable URLs for sandbox configurations
- iPad-first interaction mode
