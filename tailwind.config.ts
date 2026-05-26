import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070707',
        bg2: '#121212',
        bg3: '#1A1A1A',
        border: '#2A2A2A',
        red: {
          DEFAULT: '#C1121F',
          deep: '#7A0C14',
          glow: '#FF4D5A',
        },
        text: {
          DEFAULT: '#E5E5E5',
          secondary: '#8B8B8B',
        },
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(193,18,31,0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(193,18,31,0.7)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
