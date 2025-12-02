import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        border: 'oklch(var(--border))',
        ring: 'oklch(var(--ring))',
        grey: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#111827',
          950: '#0a0a0a',
        },
        category: {
          cybersecurity: 'oklch(var(--category-cybersecurity))',
          counterespionage: 'oklch(var(--category-counterespionage))',
          automation: 'oklch(var(--category-automation))',
          travel: 'oklch(var(--category-travel))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
