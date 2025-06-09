/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914',
          dark: '#B81D24',
          light: '#F40612',
        },
        dark: {
          100: '#000000',
          200: '#0a0a0a',
          300: '#101010',
          400: '#2F2F2F',
          500: '#333333',
        },
        light: {
          100: '#FFFFFF',
          200: '#E5E5E5',
          300: '#B3B3B3',
          400: '#808080',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};