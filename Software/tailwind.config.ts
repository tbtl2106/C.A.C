import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDF4F3",
        foreground: "#171717",
        primary: "#A52A2A", // Red dirt color
        secondary: "#228B22", // Green color
        accent: "#FF4500", // Orange for urgency
        dark: "#2C3E50", // Dark color for contrast
      },
    },
  },
  plugins: [],
};

export default config;
