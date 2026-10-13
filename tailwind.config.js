/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Retint Tailwind's gray scale to the warm charcoal-browns of the RS3
        // interface (sampled from in-game captures), so every gray panel,
        // border and label picks up the RS3 look.
        gray: {
          50: '#f6f3ee',
          100: '#ebe5dc',
          200: '#d6cdbf',
          300: '#b9ad9b',
          400: '#978a77',
          500: '#766b5c',
          600: '#5a5146',
          700: '#423b33',
          800: '#2c2823',
          900: '#1c1916',
          950: '#110f0d',
        },
        // RS3 interface palette: dark brown window bodies, bronze frames,
        // gold serif titles, maroon buttons.
        rs3: {
          bg: '#0f0d0b',
          panel: '#1e1b18',
          'panel-hi': '#2a2520',
          border: '#745d39',
          'border-hi': '#9a7e4e',
          gold: '#f0be79',
          text: '#e8e2d8',
          accent: '#e6c17d',
          success: '#5caf47',
          fail: '#f35737',
          pity: '#f59e0b'
        }
      },
      animation: {
        'void-spin': 'void-spin 3s linear infinite',
        'spin-reverse': 'spin-reverse 4s linear infinite',
        'implode': 'implode 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'shake': 'shake 0.1s linear infinite',
        'flash': 'flash 0.5s ease-out forwards',
        'float-up': 'float-up 1s ease-out forwards',
        'god-ray': 'spin-slow 10s linear infinite',
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
        'rain': 'rain 1s linear infinite',
        'focus': 'focus 2s ease-in-out forwards',
        'loading-bar': 'loading-bar 0.6s linear forwards',
        'count-pop': 'count-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        'bloom': 'bloom 0.9s ease-in-out forwards',
      },
      keyframes: {
        'void-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(0.9)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'implode': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-2px, 2px)' },
          '50%': { transform: 'translate(2px, -2px)' },
          '75%': { transform: 'translate(-2px, -2px)' },
        },
        'flash': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(2)' },
          '100%': { opacity: '0', transform: 'scale(3)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        'rain': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' }
        },
        'focus': {
          '0%': { filter: 'blur(10px)', transform: 'scale(1.5)', opacity: '0' },
          '50%': { filter: 'blur(0px)', transform: 'scale(1)', opacity: '1' },
          '100%': { filter: 'blur(0px)', transform: 'scale(1)', opacity: '1' }
        },
        'loading-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'count-pop': {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251,191,36,0)' },
          '50%': { boxShadow: '0 0 14px 1px rgba(251,191,36,0.45)' },
        },
        // A soft, single light "bloom" — a gentle fade up to a capped opacity
        // and back, instead of a hard full-screen strobe. ~1.1Hz, well under the
        // photosensitivity flash threshold, and never reaches full luminance.
        'bloom': {
          '0%': { opacity: '0' },
          '45%': { opacity: '0.4' },
          '100%': { opacity: '0' },
        },
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
