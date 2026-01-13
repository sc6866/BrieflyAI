/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
      },
      animation: {
        'in': 'fadeIn 0.4s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
  plugins: [],
}