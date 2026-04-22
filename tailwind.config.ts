import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // Plus Jakarta Sans — body / UI (default)
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        // Sora — headings only
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        // JetBrains Mono — dates, catalog refs, filenames
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo"],
      },
      colors: {
        // Canvas / surfaces
        canvas: "#f7f7f5",
        surface: "#ffffff",

        // Brand — Deep Ocean
        brand: {
          DEFAULT: "#0d9488",
          500: "#0d9488",
          400: "#14b8a6",
          accent: "#06b6d4",
        },

        // Entity palette
        people: {
          text: "#c2410c",
          bg: "#fff7ed",
          border: "#ffedd5",
        },
        place: {
          text: "#334155",
          bg: "#f1f5f9",
          border: "#e2e8f0",
        },
        org: {
          text: "#92400e",
          bg: "#fffbeb",
          border: "#fef3c7",
        },

        // Status
        ok: {
          text: "#059669",
          bg: "#ecfdf5",
        },
        warn: {
          text: "#d97706",
          bg: "#fffbeb",
        },
        danger: {
          text: "#dc2626",
          bg: "#fef2f2",
        },
        neutral: {
          text: "#a1a1aa",
          bg: "#f4f4f5",
        },

        // Ink / text ramp
        ink: {
          900: "#1a1a2e",
          700: "#3f3f46",
          600: "#52525b",
          500: "#71717a",
          400: "#a1a1aa",
          300: "#d4d4d8",
          200: "#e4e4e7",
          100: "#f4f4f5",
        },
      },
      borderRadius: {
        card: "16px",
        "card-lg": "20px",
        pill: "20px",
        btn: "10px",
        input: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        "card-lift": "0 8px 32px rgba(0,0,0,0.1)",
        btn: "0 2px 10px rgba(13,148,136,0.25)",
        glow: "0 4px 16px rgba(13,148,136,0.25)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #0d9488, #06b6d4)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
