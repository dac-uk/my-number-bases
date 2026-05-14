import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "My Number Bases — Numbers are stranger than you think",
  description:
    "An interactive playground for unusual number systems: binary, balanced ternary, base −2, imaginary bases, and the golden ratio.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100svh] antialiased">
        <div className="pointer-events-none fixed inset-0 bg-ambient-grid opacity-50" />
        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 px-4 py-6 text-xs text-white/40 sm:px-6 sm:py-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <span>My Number Bases · an interactive mathematical instrument</span>
              <span className="font-mono">∂/∂x</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
