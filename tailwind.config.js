/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Text', 'Playfair Display', 'Georgia', 'serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        leather: {
          50: '#faf6f2',
          100: '#f2e8dc',
          200: '#e4d0b8',
          300: '#d4b38e',
          400: '#c49567',
          500: '#b87d4a',
          600: '#a6683f',
          700: '#8a5236',
          800: '#714431',
          900: '#5d3a2b',
          950: '#331d15',
        },
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ed7a93',
          500: '#e04d6f',
          600: '#cc2d55',
          700: '#ab2146',
          800: '#8f1e3e',
          900: '#7a1d39',
          950: '#440b1b',
        },
        parchment: {
          50: '#fffffe',
          100: '#fdfbf7',
          200: '#faf6f0',
          300: '#f5ede0',
          400: '#eddcbc',
          500: '#e2ca9e',
          600: '#d4b37d',
          700: '#c19758',
          800: '#a07942',
          900: '#836438',
          950: '#46331c',
        },
        ink: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
      },
      backgroundImage: {
        'leather-texture': "url('/images/leather-texture.jpg')",
        'paper-texture': "url('/images/paper-texture.jpg')",
      },
      boxShadow: {
        'book': '0 0 30px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)',
        'page': '0 0 10px rgba(0, 0, 0, 0.1), 2px 0 5px rgba(0, 0, 0, 0.05)',
        'cover': '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'page-flip': 'pageFlip 0.6s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        pageFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
