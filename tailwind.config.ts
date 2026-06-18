import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6F2",
        beige: "#EFE8DD",
        peach: "#FFD8C2",
        lavender: "#DCCEF9",
        mint: "#CFE8D6",
        blue: "#C9D8F2",
        ink: "#252422",
      },
      boxShadow: {
        quiet: "0 12px 40px rgba(37, 36, 34, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
