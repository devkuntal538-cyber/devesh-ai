import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020817',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
