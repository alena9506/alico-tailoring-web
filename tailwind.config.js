/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alicoCyan: '#00A8D6',
        alicoTeal: '#5FB3B3',
      },
    },
  },
  plugins: [],
}