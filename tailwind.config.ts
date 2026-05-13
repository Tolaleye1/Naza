import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        parchment: "var(--color-parchment)",
        "parchment-dark": "var(--color-parchment-dark)",
        ink: "var(--color-ink)",
        crimson: "var(--color-crimson)",
        "crimson-deep": "var(--color-crimson-deep)",
        "crimson-light": "var(--color-crimson-light)",
        rose: "var(--color-rose)",
        "rose-light": "var(--color-rose-light)",
        burgundy: "var(--color-burgundy)",
        "burgundy-mid": "var(--color-burgundy-mid)",
        "burgundy-card": "var(--color-burgundy-card)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
        "cream-text": "var(--color-cream-text)",
        "cream-muted": "var(--color-cream-muted)",
        "border-stamp": "var(--color-border-stamp)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        shadow: "var(--color-shadow)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        script: ["var(--font-dancing)", "cursive"],
        body: ["var(--font-lato)", "sans-serif"],
      },
      fontSize: {
        hero: "var(--text-hero)",
        section: "var(--text-xl)",
        lead: "var(--text-lg)",
        body: "var(--text-base)",
        meta: "var(--text-sm)",
        stamp: "var(--text-xs)",
      },
      boxShadow: {
        romantic: "0 24px 60px var(--color-shadow)",
      },
      borderRadius: {
        romantic: "0.5rem",
      },
    },
  },
} satisfies Config;

export default config;
