/** @type {import('tailwindcss').Config} */
// Soft neo-brutalism.
// Rules (see ../docs/design-system.md):
//  - Loud chrome, calm content: the resume renders as a plain document.
//  - Hard shadow = interactive. Static surfaces are flat; decided cards go flat.
//  - Status colors (found / partial / bank) are only used for evidence status.
//    Decorative accents come from a separate purple/blue range.
//  - `flag` red is reserved for overstated-wording warnings and nothing else.
const ink = '#1E1B2B';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0',
      sm: '4px',
      DEFAULT: '6px',
      md: '8px',
      lg: '10px',
      xl: '14px',
      '2xl': '18px',
      full: '9999px',
    },
    borderWidth: {
      DEFAULT: '2px',
      0: '0',
      1: '1px',
      2: '2px',
      3: '3px',
      4: '4px',
    },
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Archivo Black"', '"Space Grotesk"', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      colors: {
        ink,
        cream: '#F6F1E8', // page background
        paper: '#FFFCF6', // off-white surfaces
        // Decorative accents (never mean status)
        accent: { DEFAULT: '#B7A3FF', soft: '#ECE6FF', strong: '#7C5CFA' },
        blue: { DEFAULT: '#B4CBFF', soft: '#E6EEFF' },
        // Evidence status (always paired with icon + label)
        found: { DEFAULT: '#9EE6AE', soft: '#E3F8E7', strong: '#2F9E4F' },
        partial: { DEFAULT: '#FFD978', soft: '#FFF3D1' },
        bank: { DEFAULT: '#8EE6DA', soft: '#DDF8F4' },
        // Reserved for overstated-wording flags only
        flag: { DEFAULT: '#E23B4E', soft: '#FFE5E8' },
        indigo: { 50: '#ECE6FF', 100: '#DED4FF', 200: ink, 300: ink, 400: ink, 500: ink, 600: ink, 700: ink, 800: ink },
        emerald: { 50: '#E3F8E7', 100: '#C9F1D2', 200: ink, 300: ink, 500: '#46B862', 600: ink, 700: ink, 800: ink },
        amber: { 50: '#FFF3D1', 200: ink, 300: ink, 600: ink, 700: ink, 800: ink, 900: ink },
        slate: {
          50: '#F6F1E8',
          100: '#EEE7DA',
          200: '#E0D7C6',
          300: '#C4B9A6',
          400: '#8F8574',
          500: '#615A4E',
          600: '#463F36',
          700: '#2E2924',
          800: '#1F1B18',
          900: ink,
        },
      },
      keyframes: {
        logIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        brut: `4px 4px 0 0 ${ink}`,
        'brut-sm': `3px 3px 0 0 ${ink}`,
        none: 'none',
      },
    },
  },
  plugins: [],
};
