/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080808',
        'surface-dark': '#0D0D0D',
        'surface-card': '#141414',
        'surface-card-hover': '#1A1A1A',
        'surface-border': '#222222',
        'surface-border-light': '#2E2E2E',
        primary: {
          DEFAULT: '#CCFF00', // Electric Volt / Neon Lime
          hover: '#B5E600',
          dim: '#9EC900',
          glow: 'rgba(204, 255, 0, 0.15)',
        },
        forge: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#333333',
          700: '#222222',
          800: '#141414',
          900: '#080808',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
