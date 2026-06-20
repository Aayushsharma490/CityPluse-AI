import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces — LIGHT THEME
        'cp-base': '#F8FAFC',
        'cp-surface': '#FFFFFF',
        'cp-surface-2': '#F1F5F9',
        'cp-border': '#E2E8F0',
        'cp-border-focus': 'rgba(13,148,136,0.40)',

        // Text — LIGHT THEME (WCAG AA compliant on white)
        'cp-text-primary': '#0F172A',
        'cp-text-secondary': '#64748B',
        'cp-text-muted': '#94A3B8',

        // Accent — Teal 600 (4.6:1 on white, WCAG AA)
        'cp-teal': '#0D9488',
        'cp-teal-light': '#CCFBF1',
        'cp-teal-dim': '#0F766E',
        'cp-teal-glow': 'rgba(13,148,136,0.12)',

        // Alert states
        'cp-amber': '#F59E0B',
        'cp-amber-light': '#FEF3C7',
        'cp-amber-dim': '#D97706',
        'cp-coral': '#EF4444',
        'cp-coral-light': '#FEE2E2',
        'cp-coral-dim': '#DC2626',

        // Category colors
        'cat-road': '#3B82F6',
        'cat-water': '#06B6D4',
        'cat-electricity': '#F59E0B',
        'cat-sanitation': '#10B981',
        'cat-other': '#6B7280',

        // Status colors (adjusted for light backgrounds)
        'status-submitted': '#64748B',
        'status-classified': '#0D9488',
        'status-routed': '#3B82F6',
        'status-inprogress': '#F59E0B',
        'status-resolved': '#10B981',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em', fontWeight: '500' }],
        'mono-sm': ['0.8125rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'card-pad': '1.5rem',
        'card-gap': '1rem',
        'section': '5rem',
        'section-sm': '3rem',
      },
      borderRadius: {
        'card': '12px',
        'badge': '6px',
        'btn': '8px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'card-teal': '0 4px 20px rgba(13,148,136,0.12)',
        'glow-teal': '0 0 16px rgba(13,148,136,0.20)',
        'glow-amber': '0 0 16px rgba(245,158,11,0.20)',
        'glow-coral': '0 0 16px rgba(239,68,68,0.20)',
        'nav': '0 1px 0 #E2E8F0',
      },
      keyframes: {
        'radar-ping': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'radar-ping': 'radar-ping 2s ease-out infinite',
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
