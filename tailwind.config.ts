import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
      },
      colors: {
        parchment: {
          50: "#fbfaf7",
          100: "#f5f3ec",
          200: "#ece8db",
          300: "#ddd6c0",
          400: "#c3b98f",
          500: "#a79871",
        },
        ink: {
          50: "#f6f6f5",
          100: "#e7e7e5",
          200: "#c9c9c5",
          300: "#a3a39d",
          400: "#7a7a74",
          500: "#58584f",
          600: "#3d3d37",
          700: "#2a2a25",
          800: "#1a1a16",
          900: "#0f0f0c",
        },
        accent: {
          50: "#fdf7ed",
          100: "#f8e8c7",
          200: "#efcf8b",
          300: "#e4b152",
          400: "#d69a2f",
          500: "#b97d19",
          600: "#8f5d13",
          700: "#6a4410",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 15, 12, 0.04), 0 1px 3px 0 rgba(15, 15, 12, 0.06)",
        "card-hover":
          "0 4px 8px -2px rgba(15, 15, 12, 0.08), 0 2px 4px -2px rgba(15, 15, 12, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
