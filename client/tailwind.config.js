/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#040406',
          900: '#07070A',
          850: '#0C0C12',
          800: '#111119',
          750: '#171722',
          700: '#1E1E2B',
          600: '#2A2A3C',
          500: '#404058'
        },
        gold: {
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309'
        },
        lunar: {
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Syne', '"Plus Jakarta Sans"', 'sans-serif'],
        cinematic: ['Cinzel', 'serif']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    },
  },
  plugins: [],
}
