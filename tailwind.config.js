/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          dark: '#0a0d18',
          card: '#121829',
          border: '#1e293b',
          cyan: '#00f3ff',
          purple: '#b026ff',
          emerald: '#00ff88',
          amber: '#ffb700',
          rose: '#ff2a6d'
        }
      },
      animation: {
        'glow-pulse': 'glow 2s infinite ease-in-out',
        'float': 'float 4s infinite ease-in-out',
        'shake': 'shake 0.4s ease-in-out',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 243, 255, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(176, 38, 255, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
