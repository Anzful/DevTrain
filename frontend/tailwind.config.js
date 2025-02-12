/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e6edf2',  // very light blue-gray
          100: '#cfd8e5',  // light blue-gray
          200: '#9fb1cb',  // soft blue
          300: '#709ab1',  // medium-light navy
          400: '#417399',  // lighter navy
          500: '#162a65',  // **Main Dark Navy Blue**
          600: '#13224d',  // slightly darker navy
          700: '#0f1c3a',  // dark navy
          800: '#0a1527',  // very dark navy
          900: '#070e19',  // near-black navy
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
