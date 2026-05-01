/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#2563eb",
        brandDark: "#1e3a8a",
        brandYellow: "#fbbf24",
      },
    },
  },
  plugins: [],
};
