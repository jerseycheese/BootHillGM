import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Make sure Storybook files are processed
    "./.storybook/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.stories.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Common classes that might be dynamically generated
    'bg-green-500',
    'bg-red-500',
    'bg-blue-500',
    'p-4', 'm-2', 'm-4', 'bg-background', 'text-foreground',
    'flex', 'items-center', 'justify-between'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;