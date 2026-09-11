import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sbi: {
          surface: "var(--brand-surface, #ffffff)",
          panel: "var(--brand-panel, #f2f2f3)",
          border: "var(--brand-border, #ececec)",
          accent: "var(--brand-accent, #17191c)",
          highlight: "var(--brand-highlight, #17191c)",
          muted: "var(--brand-muted, #777b86)",
        },
        brand: {
          surface: "var(--brand-surface, #ffffff)",
          panel: "var(--brand-panel, #f2f2f3)",
          border: "var(--brand-border, #ececec)",
          accent: "var(--brand-accent, #17191c)",
          highlight: "var(--brand-highlight, #17191c)",
          muted: "var(--brand-muted, #777b86)",
        },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      },
      fontFamily: {
        sans: ["var(--font-sohne)"] ,
        display: ["var(--font-signifier)"],
      },
    },
  },
  plugins: [],
};

export default config;
