import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        surface: '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#45464d',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#76777d',
        'outline-variant': '#c6c6cd',
        'surface-tint': '#565e74',
        primary: {
          DEFAULT: '#0f172a',
          foreground: '#ffffff',
          container: '#131b2e',
          'on-container': '#7c839b',
          inverse: '#bec6e0',
          fixed: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        secondary: {
          DEFAULT: '#0051d5',
          foreground: '#ffffff',
          container: '#316bf3',
          'on-container': '#fefcff',
          fixed: '#dbe1ff',
          'fixed-dim': '#b4c5ff',
        },
        tertiary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
          container: '#0d1c2e',
          'on-container': '#77859a',
          fixed: '#d5e3fc',
          'fixed-dim': '#b9c7df',
        },
        error: {
          DEFAULT: '#ba1a1a',
          foreground: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        background: '#f8f9ff',
        'on-background': '#0b1c30',
        'surface-variant': '#d3e4fe',
      },
      spacing: {
        gutter: '1rem',
        margin: '1.5rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.75rem',
        'space-lg': '1.25rem',
        'space-xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
