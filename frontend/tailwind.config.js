/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          light: '#2d5a8e',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
        },
      },
    },
  },
  plugins: [],
}
