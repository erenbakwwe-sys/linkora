import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070c16',
          900: '#0b1220',
          800: '#131e36',
          700: '#1e2d4f',
        },
        brand: {
          amber: '#f59e0b',
          yellow: '#eab308',
          blue: '#0284c7',
          lightBlue: '#e0f2fe',
        },
      },
      spacing: {
        '4.5': '1.125rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
