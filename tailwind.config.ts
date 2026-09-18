import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background & Surfaces
        bg: {
          DEFAULT: "#0B0E14",
          surface: "#141821",
          border: "#232838",
        },
        // Accent colors
        accent: {
          DEFAULT: "#4F7CFF",
          hover: "#6B91FF",
          muted: "#4F7CFF20",
        },
        success: {
          DEFAULT: "#34D399",
          muted: "#34D39920",
        },
        warning: {
          DEFAULT: "#FBBF24",
          muted: "#FBBF2420",
        },
        safety: {
          DEFAULT: "#94A3B8",
          muted: "#94A3B820",
        },
        // Text
        text: {
          DEFAULT: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "heading-lg": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-md": ["28px", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-sm": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "card-title": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "card-body": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        card: "16px",
        button: "10px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 32px rgba(79, 124, 255, 0.15)",
        glow: "0 0 20px rgba(79, 124, 255, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
