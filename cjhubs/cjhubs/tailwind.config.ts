import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        // Deep navy — primary brand scale (surfaces, headings, primary CTAs)
        brand: {
          50: "#eef3ff",
          100: "#dbe6fb",
          200: "#b0c4ee",
          300: "#7fa0e0",
          400: "#4a72c9",
          500: "#2a4a9e",
          600: "#1f3a82",
          700: "#172c66",
          800: "#101f4a",
          900: "#0a1533",
          950: "#050b1c",
        },
        // Warm gold — accent scale (glow, badges, highlights, gift accents)
        solar: {
          400: "#f5d576",
          500: "#d4af37",
          600: "#b8860b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgb(var(--glow) / 0.55)",
        "glow-lg": "0 0 80px -20px rgb(var(--glow) / 0.65)",
        card: "0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -8px rgb(0 0 0 / 0.12)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(var(--glow) / 0.22), transparent 70%)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "80%,100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "beam-move": {
          "0%": { transform: "translateX(-30%)" },
          "100%": { transform: "translateX(30%)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "beam-move": "beam-move 8s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
