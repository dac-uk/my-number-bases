"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/explore", label: "Explore" },
  { href: "/imaginary", label: "Imaginary" },
  { href: "/infinity", label: "Infinity" },
  { href: "/patterns", label: "Patterns" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/lab", label: "Lab" },
  { href: "/learn", label: "Learn" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-neon-cyan to-neon-violet text-ink-950">
              <span className="font-mono text-sm font-bold">∞</span>
            </span>
            <span className="hidden font-display text-lg tracking-tight sm:inline">
              My Number Bases
            </span>
            <span className="font-display text-lg tracking-tight sm:hidden">
              MNB
            </span>
          </Link>
          <nav className="-mx-2 ml-auto flex items-center gap-0.5 overflow-x-auto px-2 text-sm [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
            {LINKS.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`shrink-0 rounded-full px-2.5 py-1.5 transition sm:px-3 ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
