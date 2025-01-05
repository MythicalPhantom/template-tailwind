/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transform: { 'rotate-y-180': 'rotateY(180deg)', },
    },
  },
  plugins: [require("daisyui")],
};
