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
        // Base Palette (STRICT: White, Purple, Gray shades, NO pure black)
        white: "#FFFFFF",
        primary: {
          DEFAULT: "#7C3AED", // Violet / Purple accent
          hover: "#6D28D9",
          light: "#F5F3FF",
          muted: "rgba(124, 58, 237, 0.1)",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          muted: "#F3F4F6", // Gray surface
          border: "#E5E7EB",
        },
        ink: {
          DEFAULT: "#111827", // Darkest text (not black #000000)
          secondary: "#4B5563",
          muted: "#6B7280",
          light: "#9CA3AF",
        },
        // Soft status colors for badges / alerts only
        success: {
          DEFAULT: "#10B981",
          muted: "rgba(16, 185, 129, 0.1)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.1)",
        },
        danger: {
          DEFAULT: "#EF4444",
          muted: "rgba(239, 68, 68, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "14px",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(17, 24, 39, 0.05)",
        card: "0 4px 20px rgba(17, 24, 39, 0.06)",
        "card-hover": "0 10px 25px rgba(124, 58, 237, 0.12)",
        purple: "0 4px 14px rgba(124, 58, 237, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
