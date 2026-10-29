import type { Config } from 'tailwindcss';

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
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
