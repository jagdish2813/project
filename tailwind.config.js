/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf7f0',
          100: '#faeee0',
          200: '#f4d5c0',
          300: '#ecb896',
          400: '#e3926a',
          500: '#E07A5F',
          600: '#d96746',
          700: '#b5533a',
          800: '#914536',
          900: '#753b31',
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#3D5A80',
          600: '#2c4963',
          700: '#243e56',
          800: '#1e3349',
          900: '#19293a',
        },
        accent: {
          50: '#fdfcf7',
          100: '#faf6e8',
          200: '#f4ebcc',
          300: '#ecdba5',
          400: '#e2c67c',
          500: '#F2CC8F',
          600: '#d4a574',
          700: '#b48860',
          800: '#926d4f',
          900: '#765941',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
};