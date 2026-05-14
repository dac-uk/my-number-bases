import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0c14",
          800: "#10131d",
          700: "#181c2a",
          600: "#222740",
          500: "#2f3656",
        },
        neon: {
          cyan: "#7df9ff",
          violet: "#b388ff",
          magenta: "#ff5fa2",
          gold: "#f5c76a",
          mint: "#7affc6",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "JetBrains Mono", "monospace"],
        display: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(125, 249, 255, 0.35)",
        glowViolet: "0 0 60px -10px rgba(179, 136, 255, 0.45)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
