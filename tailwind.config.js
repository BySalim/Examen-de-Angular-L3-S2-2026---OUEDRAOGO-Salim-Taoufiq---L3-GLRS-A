/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--k-bg) / <alpha-value>)',
        surface: 'rgb(var(--k-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--k-surface-2) / <alpha-value>)',
        hairline: 'rgb(var(--k-hairline) / <alpha-value>)',
        content: {
          DEFAULT: 'rgb(var(--k-text) / <alpha-value>)',
          muted: 'rgb(var(--k-text-muted) / <alpha-value>)',
          subtle: 'rgb(var(--k-text-subtle) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--k-primary) / <alpha-value>)',
          fg: 'rgb(var(--k-primary-fg) / <alpha-value>)',
        },
        gold: 'rgb(var(--k-gold) / <alpha-value>)',
        success: 'rgb(var(--k-success) / <alpha-value>)',
        danger: 'rgb(var(--k-danger) / <alpha-value>)',
        warning: 'rgb(var(--k-warning) / <alpha-value>)',
        info: 'rgb(var(--k-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 20px rgb(15 23 42 / 0.06)',
        lift: '0 2px 6px rgb(15 23 42 / 0.06), 0 12px 32px rgb(15 23 42 / 0.10)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-in': { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        'slide-in': 'slide-in 0.22s ease-out',
      },
    },
  },
  plugins: [],
};
