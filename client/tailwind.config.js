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
        // Core cricket accent palette
        cricket: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        pitch: {
          950: '#05070D',
          900: '#07090F',
          850: '#0B0E18',
          800: '#0F1220',
          750: '#131828',
          700: '#1A2035',
          600: '#232C42',
        },
        // New navy design surface system (primary surfaces from image)
        navy: {
          950: '#060A14',
          900: '#0A0F1C',
          800: '#0E1525',
          700: '#131C2E',
          600: '#1A2540',
          500: '#243050',
          400: '#2E3C62',
          300: '#3E5080',
        },
        // Ball bead accent colors
        bead: {
          four: '#22c55e',
          six: '#a855f7',
          wicket: '#ef4444',
          dot: '#334155',
          run: '#94a3b8',
        },
        // Match status accent system
        accent: {
          live: '#ef4444',
          upcoming: '#f59e0b',
          result: '#6b7280',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'live-dot': 'livePulse 1.8s ease-in-out infinite',
        'score-flash': 'scoreFlash 0.6s ease-out',
        'bar-fill': 'barFill 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'bead-pop': 'beadPop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.35)', opacity: '0.6' },
        },
        scoreFlash: {
          '0%': { opacity: '0.5', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        barFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        beadPop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        'live-glow': '0 0 12px rgba(239,68,68,0.3)',
        'green-glow': '0 0 16px rgba(34,197,94,0.25)',
        'blue-glow': '0 0 16px rgba(59,130,246,0.25)',
      },
    },
  },
  plugins: [],
}
