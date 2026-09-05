/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f3f8f4',
          100: '#e4f0e8',
          200: '#c5dccb',
          700: '#1f6b52',
          800: '#155544',
          900: '#0d3b31',
          950: '#08251f'
        },
        sand: {
          50: '#fffdf8',
          100: '#f7f1e6',
          200: '#eadfcd'
        },
        gold: {
          400: '#e0c27a',
          500: '#c9a24a',
          600: '#a9842e'
        },
        coral: {
          500: '#c45c4a',
          600: '#a94838'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        lift: '0 30px 60px -36px rgba(13, 59, 49, 0.45)',
        card: '0 1px 0 rgba(255,255,255,0.85) inset, 0 18px 40px -28px rgba(13, 59, 49, 0.28)',
        glow: '0 0 0 1px rgba(201, 162, 74, 0.22), 0 16px 40px -24px rgba(13, 59, 49, 0.4)'
      }
    },
  },
  plugins: [],
}
