import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        'xs': '360px', // Extra small devices (phones, 360px and down)
        'sm': '640px', // Small devices (phones, 640px and down)
        'md': '768px', // Medium devices (tablets, 768px and down)
        'lg': '1024px', // Large devices (desktops, 1024px and down)
        'xl': '1280px', // Extra large devices (large desktops, 1280px and down)
        '2xl': '1536px', // 2xl screens (1536px and up)
      },
    },
  },  
  plugins: [],
};
export default config;
