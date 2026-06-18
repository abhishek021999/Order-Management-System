/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease-out',
        'slide-up':    'slideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
        'slide-in':    'slideIn 0.28s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':  'slideDown 0.28s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':    'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow':   'spin 1.4s linear infinite',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0/.06),0 1px 2px -1px rgb(0 0 0/.04)',
        'card-md': '0 4px 12px 0 rgb(0 0 0/.07),0 2px 4px -1px rgb(0 0 0/.04)',
        'lift':    '0 8px 24px 0 rgb(0 0 0/.10),0 2px 6px -2px rgb(0 0 0/.06)',
        'float':   '0 20px 40px -8px rgb(0 0 0/.14),0 8px 16px -4px rgb(0 0 0/.06)',
        'glow':    '0 0 0 3px rgb(99 102 241/.18)',
        'glow-sm': '0 0 0 2px rgb(99 102 241/.14)',
        'inner-sm':'inset 0 1px 3px 0 rgb(0 0 0/.06)',
        'brand':   '0 4px 16px 0 rgb(79 70 229/.30)',
        'brand-lg':'0 8px 24px 0 rgb(79 70 229/.35)',
        'rose':    '0 4px 16px 0 rgb(244 63 94/.30)',
      },
      backdropBlur: {
        xs: '2px',
      },
      ringWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
