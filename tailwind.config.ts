import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Ludo Player Colors - Vibrant & Glossy
        ludo: {
          red: {
            DEFAULT: "#FF4757", // Vibrant Red
            light: "#FF6B81",
            dark: "#C41E3A",
            shadow: "#8B0000",
          },
          green: {
            DEFAULT: "#2ED573", // Vibrant Green
            light: "#7BED9F",
            dark: "#26AF61",
            shadow: "#1E824C",
          },
          yellow: {
            DEFAULT: "#FFA502", // Vibrant Yellow
            light: "#FFD32A",
            dark: "#D38C02",
            shadow: "#A36A00",
          },
          blue: {
            DEFAULT: "#1E90FF", // Vibrant Blue
            light: "#70A1FF",
            dark: "#3742FA",
            shadow: "#093693",
          },
        },
        board: {
          bg: "#FFFFFF",
          cell: "#FFFFFF",
          safe: "#E2E8F0", // Slate-200
          center: "#F8FAFC",
          border: "#1E293B", // Slate-800
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-slight": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "bounce-slight": "bounce-slight 2s infinite",
      },
      boxShadow: {
        "token": "0 4px 0 rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.3)", // 3D Chip effect
        "token-hover": "0 6px 0 rgba(0,0,0,0.3), 0 8px 15px rgba(0,0,0,0.3)",
        "dice": "inset -5px -5px 10px rgba(0,0,0,0.2), inset 5px 5px 10px rgba(255,255,255,0.5), 5px 10px 15px rgba(0,0,0,0.3)",
        "board": "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
        "card-3d": "0 8px 0 rgba(0,0,0,0.2), 0 10px 10px rgba(0,0,0,0.1)",
        "btn-3d": "0 4px 0 rgba(0,0,0,0.2)",
        "btn-3d-active": "0 0 0 rgba(0,0,0,0.2)",
        "glow-red": "0 0 20px rgba(255, 71, 87, 0.6)",
        "glow-green": "0 0 20px rgba(46, 213, 115, 0.6)",
        "glow-yellow": "0 0 20px rgba(255, 165, 2, 0.6)",
        "glow-blue": "0 0 20px rgba(30, 144, 255, 0.6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
