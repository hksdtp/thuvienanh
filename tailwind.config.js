/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // macOS/iOS Design System Colors
        macos: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F5F5F7',
            tertiary: '#FAFAFA',
          },
          text: {
            primary: '#1D1D1F',
            secondary: '#6E6E73',
            tertiary: '#86868B',
          },
          border: {
            DEFAULT: '#D2D2D7',
            light: '#E5E5EA',
          },
          accent: {
            DEFAULT: '#007AFF',
            hover: '#0051D5',
          }
        },
        // iOS color palette (keep for compatibility)
        ios: {
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F7',
            200: '#E5E5EA',
            300: '#D2D2D7',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#6E6E73',
            800: '#48484A',
            900: '#1D1D1F',
          },
          blue: {
            DEFAULT: '#007AFF',
            50: '#E5F2FF',
            100: '#CCE5FF',
            500: '#007AFF',
            600: '#0051D5',
            dark: '#0051D5',
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // macOS Typography Scale
        'xs': ['11px', { lineHeight: '16px', letterSpacing: '-0.01em' }],
        'sm': ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
        'base': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
        'lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '4xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        // iOS specific (keep for compatibility)
        'ios-xs': ['11px', { lineHeight: '16px' }],
        'ios-sm': ['13px', { lineHeight: '18px' }],
        'ios-base': ['14px', { lineHeight: '20px' }],
        'ios-lg': ['16px', { lineHeight: '24px' }],
      },
      spacing: {
        // macOS Spacing System
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '10px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        // iOS specific (keep for compatibility)
        'ios': '10px',
        'ios-sm': '8px',
        'ios-lg': '12px',
      },
      boxShadow: {
        // macOS Shadows - Very subtle
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'xl': '0 8px 24px rgba(0, 0, 0, 0.10)',
        // iOS specific (keep for compatibility)
        'ios': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'ios-lg': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
      },
      transitionDuration: {
        'DEFAULT': '200ms',
        'fast': '150ms',
        'slow': '300ms',
        'ios': '250ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'macos': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ios': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        'macos': '20px',
      },
    },
  },
  plugins: [],
}
