/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        pill: '999px',
        sm: '12px',
        md: '18px',
        lg: '22px',
      },
    },
  },
  plugins: [],
}
