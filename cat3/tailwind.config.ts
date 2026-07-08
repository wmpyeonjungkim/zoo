import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'pop': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'fall': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        'combo': {
          '0%': { transform: 'scale(0.5) translateY(0)', opacity: '0' },
          '30%': { transform: 'scale(1.3) translateY(-10px)', opacity: '1' },
          '70%': { transform: 'scale(1.1) translateY(-20px)', opacity: '1' },
          '100%': { transform: 'scale(0.8) translateY(-40px)', opacity: '0' },
        },
        'swap': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'var(--swap-translate)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'cat-match': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.25) rotate(-8deg)' },
          '50%': { transform: 'scale(1.3) rotate(8deg)' },
          '75%': { transform: 'scale(1.15) rotate(-4deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'cat-combo': {
          '0%': { transform: 'scale(1) translateY(0)' },
          '20%': { transform: 'scale(1.35) translateY(-6px)' },
          '40%': { transform: 'scale(1.35) translateY(-10px)' },
          '60%': { transform: 'scale(1.3) translateY(-6px)' },
          '80%': { transform: 'scale(1.15) translateY(-2px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        'cat-celebrate': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '15%': { transform: 'scale(1.4) rotate(-12deg)' },
          '30%': { transform: 'scale(1.5) rotate(12deg)' },
          '45%': { transform: 'scale(1.4) rotate(-8deg)' },
          '60%': { transform: 'scale(1.3) rotate(6deg)' },
          '75%': { transform: 'scale(1.2) rotate(-3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'match-flash': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '30%': { opacity: '1', transform: 'scale(1.1)' },
          '60%': { opacity: '0.8', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.2)' },
        },
        'score-pop': {
          '0%': { transform: 'scale(1)', color: 'inherit' },
          '50%': { transform: 'scale(1.3)', color: '#16a34a' },
          '100%': { transform: 'scale(1)', color: 'inherit' },
        },
      },
      animation: {
        'pop': 'pop 0.3s ease-out forwards',
        'fall': 'fall 0.25s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'combo': 'combo 1s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'twinkle': 'twinkle 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'cat-match': 'cat-match 0.5s ease-out',
        'cat-combo': 'cat-combo 0.6s ease-out',
        'cat-celebrate': 'cat-celebrate 0.8s ease-out',
        'match-flash': 'match-flash 0.4s ease-out forwards',
        'score-pop': 'score-pop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
