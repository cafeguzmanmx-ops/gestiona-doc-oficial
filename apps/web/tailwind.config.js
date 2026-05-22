/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f7fb',
          100: '#e6eef7',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#0f172a'
        }
      }
    },
  },
  plugins: [],
};
