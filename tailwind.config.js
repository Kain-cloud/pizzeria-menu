/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf5f5',
          100: '#fce8e8',
          200: '#f8d0d0',
          500: '#9B2C2C',
          600: '#822727',
          700: '#6B2020',
        },
        warm: {
          50:  '#FAFAF7',
          100: '#F5F2ED',
          200: '#E8E2DA',
          300: '#D4CBC0',
          400: '#9C958E',
          500: '#6B635B',
          600: '#4A443D',
          800: '#2D2420',
          900: '#1A1614',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
