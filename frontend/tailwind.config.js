export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      colors: {
        tierA: "#dc2626",
        tierB: "#f59e0b",
        tierC: "#6b7280"
      }
    }
  },
  plugins: []
};
