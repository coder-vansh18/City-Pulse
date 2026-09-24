import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        status: {
          calm: 'var(--status-calm)',
          watch: 'var(--status-watch)',
          strained: 'var(--status-strained)',
          critical: 'var(--status-critical)',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-calm': '0 0 20px -5px rgba(45, 212, 167, 0.4)',
        'glow-watch': '0 0 20px -5px rgba(245, 197, 66, 0.4)',
        'glow-strained': '0 0 20px -5px rgba(255, 138, 61, 0.4)',
        'glow-critical': '0 0 20px -5px rgba(255, 77, 109, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
