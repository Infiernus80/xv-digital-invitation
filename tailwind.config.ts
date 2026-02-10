import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        moonTime: ["var(--font-moon-time)", "serif"],
        dancingScript: ["var(--font-dancing-script)", "serif"],
        badScript: ["var(--font-bad-script)", "cursive"],
      },
    },
  },
  plugins: [],
} satisfies Config;
