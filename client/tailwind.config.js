/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',      // verde
        secondary: '#3b82f6',    // azul
      }
    },
  },
  plugins: [],
}