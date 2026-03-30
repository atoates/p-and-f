import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-green": "#2d5a3d",
        "light-green": "#4a7c59",
        "accent-pink": "#d4897f",
        "light-pink": "#f5e6e3",
        "soft-cream": "#faf8f6",
      },
    },
  },
  plugins: [forms],
};

export default config;
