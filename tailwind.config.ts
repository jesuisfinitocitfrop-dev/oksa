import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#FFE566',
          400: '#FFD700',
          500: '#FFC200',
          600: '#FFB300',
        },
        fire: {
          400: '#FF8C00',
          500: '#FF6B00',
          600: '#FF4500',
        },
        cit: {
          purple: '#7C3AED',
          dark: '#0A0A0F',
          card: '#12121A',
          border: '#1E1E2E',
        },
      },
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'ember-1': 'ember 4s ease-in infinite',
        'ember-2': 'ember 5s ease-in infinite 1s',
        'ember-3': 'ember 3.5s ease-in infinite 2s',
        'ember-4': 'ember 6s ease-in infinite 0.5s',
        'ember-5': 'ember 4.5s ease-in infinite 1.5s',
        'ember-6': 'ember 5.5s ease-in infinite 3s',
        'ember-7': 'ember 3s ease-in infinite 2.5s',
        'ember-8': 'ember 6.5s ease-in infinite 0.8s',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'count-up': 'countUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        ember: {
          '0%': { transform: 'translateY(100vh) translateX(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateY(50vh) translateX(20px) scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'translateY(-10vh) translateX(-10px) scale(0.3)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px #FFD700, 0 0 40px #FF6B00' },
          '50%': { boxShadow: '0 0 40px #FFD700, 0 0 80px #FF6B00, 0 0 120px #FF4500' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        countUp: {
          from: { transform: 'scale(1.5)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(to top, #FF4500, #FF6B00, #FFD700)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #FFA500)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
      },
    },
  },
  plugins: [],
}

export default config
