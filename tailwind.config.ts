import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sbi: {
          surface: "#06112d",
          panel: "#081c42",
          border: "#143b75",
          accent: "#1d8bff",
          highlight: "#7ec7ff",
          muted: "#9cb7d4",
        },
      },
      boxShadow: {
        panel: "0 24px 120px rgba(0, 13, 43, 0.35)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
