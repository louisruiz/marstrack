/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
    theme: {
      extend: {
        colors: {
          primary: '#3498db',
          secondary: '#2c3e50',
          success: '#2ecc71',
          warning: '#f39c12',
          danger: '#e74c3c',
          info: '#9b59b6'
        }
      },
    },
    plugins: [],
  }