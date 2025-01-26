/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          300: "#B8B5FF", // Adjust this hex code to match your design exactly
        },
      },
      backgroundImage: {
        "gradient-custom":
          "linear-gradient(132.2deg, #2F3336 18.4%, #252527 76.27%)",
      },
    },
  },
  plugins: [],
};
