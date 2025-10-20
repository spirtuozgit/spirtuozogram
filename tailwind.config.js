/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#f2f2f2',
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-links': '#6ae3ff',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-quotes': '#cccccc',
            '--tw-prose-quote-borders': '#555555',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
