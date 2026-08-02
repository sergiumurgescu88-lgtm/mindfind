/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#eef1f6',
          100: '#d3daea',
          400: '#4a5f8a',
          600: '#243a63',
          700: '#1a2c4d',
          800: '#12203a',
          900: '#0b1526',
        },
        brass: {
          50: '#fbf3e6',
          100: '#f6e8d2',
          300: '#e3bd7e',
          500: '#c68e3f',
          600: '#a86f2b',
          700: '#835420',
        },
        paper: '#f7f5f0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(198,142,63,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(198,142,63,0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '14px',
        md: '16px',
        lg: '22px',
        xl: '28px',
        '2xl': '36px',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(18,32,58,0.08), 0 8px 24px -8px rgba(18,32,58,0.10)',
        card: '0 1px 2px rgba(18,32,58,0.04), 0 12px 32px -12px rgba(18,32,58,0.14)',
        glow: '0 0 0 1px rgba(198,142,63,0.15), 0 8px 30px -6px rgba(198,142,63,0.25)',
      },
    },
  },
  plugins: [],
};
