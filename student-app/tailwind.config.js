/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#EEF0FF',
          300: '#A5B4FC',
          500: '#4F46E5',
          600: '#4338CA',
        },
        ink: {
          300: '#9CA3AF',
          500: '#6B7280',
          700: '#374151',
          900: '#0F1117',
        },
        line: '#E8E8EF',
        surface: '#FFFFFF',
        canvas: '#F7F7FB',
        fit: { 100: '#DCFCE7', 500: '#16A34A', 600: '#15803D' },
        gap: { 100: '#FFEDD5', 500: '#EA580C', 600: '#C2410C' },
        pass: { 100: '#FEE2E2', 500: '#DC2626' },
        save: { 100: '#FEF3C7', 500: '#F59E0B' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '28px' },
      boxShadow: {
        subtle: '0 1px 3px rgba(15,17,23,0.06)',
        card: '0 4px 12px rgba(15,17,23,0.08)',
        raised: '0 8px 24px rgba(15,17,23,0.10)',
        deck: '0 12px 32px rgba(15,17,23,0.14)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        confetti: {
          from: { transform: 'translateY(-30px) rotate(0deg)', opacity: '1' },
          to: { transform: 'translateY(720px) rotate(540deg)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-320px 0' },
          '100%': { backgroundPosition: '320px 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .28s ease both',
        popIn: 'popIn .3s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
