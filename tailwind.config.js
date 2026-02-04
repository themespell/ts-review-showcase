/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/**/*.jsx',
    './src/**/*.json',
    './templates/**/*.html',
    './includes/templates/**/*.php',
    './parts/**/*.html',
  ],
  theme: {
    screens: {
      'sm': '360px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
    daisyui: {
        styled: false,
        themes: false,
        base: false,
        utils: true,
        logs: false,
    },
}
