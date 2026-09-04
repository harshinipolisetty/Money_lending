/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#161310',
          muted: '#6f675f',
          soft: '#9a9288'
        },
        paper: {
          DEFAULT: '#f4f0ea',
          raised: '#fbf9f6',
          line: '#ddd6cb'
        },
        pine: {
          DEFAULT: '#2a241f',
          dark: '#1a1613',
          light: '#3d352e'
        },
        marigold: {
          DEFAULT: '#b89463',
          dark: '#9a7849'
        },
        clay: '#8a4a42'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        lift: '0 20px 40px -28px rgba(26, 22, 19, 0.55)',
        card: '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 30px -20px rgba(22, 19, 16, 0.28)'
      },
      letterSpacing: {
        luxury: '0.28em'
      }
    },
  },
  plugins: [],
}
