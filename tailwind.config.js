/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0066FF',
        'brand-dark': '#0A0A0A',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
