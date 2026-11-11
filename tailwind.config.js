/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          yellow: '#FEF9C3',
          pink: '#FCE7F3',
          green: '#DCFCE7',
          blue: '#E0F2FE',
          purple: '#F3E8FF',
        }
      }
    },
  },
  plugins: [],
}
