/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8f5f0',
        ivory: '#f8f5f0',
        sand: '#e5dec9',
        beige: '#e5dec9',
        clay: '#c19a5b',
        gold: '#b99559',
        terracotta: '#b05c3b',
        emerald: '#174536',
        ink: '#23302a',
        muted: '#8c7a6b',
        border: '#e4dac9',
      },
      fontFamily: {
        serif: ['Amiri', 'serif'],
        sans: ['Cairo', 'sans-serif'],
        display: ['Tajawal', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease both',
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.22, 0.8, 0.25, 1) both',
      },
    },
  },
  plugins: [],
};
