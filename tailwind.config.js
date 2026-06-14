/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: '#0a0a1a',
          secondary: '#12122a',
          tertiary: '#1a1a3a',
          card: 'rgba(26, 26, 58, 0.6)',
        },
        border: {
          primary: 'rgba(139, 92, 246, 0.2)',
          secondary: 'rgba(139, 92, 246, 0.1)',
          hover: 'rgba(139, 92, 246, 0.4)',
        },
        accent: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          pink: '#ec4899',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          tertiary: '#64748b',
          disabled: '#475569',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(139, 92, 246, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
