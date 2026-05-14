import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "My Number Bases — Numbers are stranger than you think",
  description:
    "An interactive playground for unusual number systems: binary, balanced ternary, base −2, imaginary bases, and the golden ratio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="pointer-events-none fixed inset-0 bg-ambient-grid opacity-50" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 px-6 py-8 text-xs text-white/40">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <span>My Number Bases · an interactive mathematical instrument</span>
              <span className="font-mono">∂/∂x</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
