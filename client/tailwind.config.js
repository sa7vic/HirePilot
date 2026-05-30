/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        night: "#0b1120",
        paper: "#f8fafc",
        mist: "#e2e8f0",
        accent: "#f59e0b",
        mint: "#14b8a6",
        ocean: "#0ea5e9",
        ruby: "#ef4444",
      },
      fontFamily: {
        heading: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -30px rgba(14, 165, 233, 0.6)",
        card: "0 20px 40px -30px rgba(15, 23, 42, 0.4)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
