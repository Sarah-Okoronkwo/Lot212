/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-syne)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#ededf0',
          200: '#d8d8de',
          300: '#b6b6c0',
          400: '#8e8ea0',
          500: '#717183',
          600: '#5c5c6e',
          700: '#4b4b5a',
          800: '#40404d',
          900: '#383843',
          950: '#18181f',
        },
        accent: {
          DEFAULT: '#e8ff47',
          dark: '#c8df00',
        },
        signal: {
          red: '#ff3b3b',
          blue: '#0070f3',
          green: '#00c853',
        }
      },
      keyframes: {
        'story-progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'story-progress': 'story-progress linear forwards',
        'fade-up': 'fade-up 0.5s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'scale-in': 'scale-in 0.3s ease forwards',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulse-soft 2s ease infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
