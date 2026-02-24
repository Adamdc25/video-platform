import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors - updated to match new brand
        brand: {
          50: '#e8faf7',
          100: '#d1f5f0',
          200: '#a3eae1',
          300: '#75dfd2',
          400: '#49BBA6',
          500: '#49BBA6',
          600: '#3a9285',
          700: '#2b6964',
          800: '#1c4043',
          900: '#0d2122',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
export default config
