/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bauhaus monochromatic palette
        'arc-black': '#09090b', // Zinc-950, but darker
        'arc-white': '#fafafa', // Zinc-50
        'arc-gray': '#52525b', // Zinc-600
        'arc-accent': '#dc2626', // Red-600 for active states
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Courier New', 'monospace'],
      },
      fontSize: {
        'tabular': ['1rem', { fontVariantNumeric: 'tabular-nums' }],
      },
      spacing: {
        'grid': '1rem', // 16px grid baseline
      },
      borderRadius: {
        'none': '0px', // No rounded corners
      },
    },
  },
  plugins: [],
  important: true, // Ensure Tailwind wins over base styles
}
