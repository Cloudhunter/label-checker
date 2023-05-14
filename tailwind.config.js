/** @type {import('tailwindcss').Config} */
module.exports = {
  //purge: ["./pages/**/*.tsx", "./components/**/*.tsx"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /bg-(red|green|blue|)-(500|600|200)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
