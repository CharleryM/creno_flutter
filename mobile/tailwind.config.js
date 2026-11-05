/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        creno: {
          lime: "#C7FF3D",
          black: "#111111",
          gray: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};