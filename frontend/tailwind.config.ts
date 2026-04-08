import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB", // Elegant royal blue (lighter than before)
          light: "#60A5FA",   // Soft light blue
          dark: "#1E40AF",    // Rich dark blue
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#F8FAFC", // Slate 50 for very subtle backgrounds
          foreground: "#334155", // Slate 700
        },
        accent: {
          DEFAULT: "#38BDF8", // Sky 400
          foreground: "#0F172A",
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
};

export default config;
