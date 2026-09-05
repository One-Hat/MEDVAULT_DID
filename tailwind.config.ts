import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paperNavy: "#070C15",
        cardNavy: "#0E1726",
        subNavy: "#142034",
        borderNavy: "#1E2E48",
        surgicalTeal: "#10B981",
        tealHover: "#059669",
        warmCoral: "#F43F5E",
        coralHover: "#E11D48",
        textBone: "#F8FAFC",
        textMuted: "#94A3B8",
      },
      backgroundImage: {
        'radial-mesh': 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
