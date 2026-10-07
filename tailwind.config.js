/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mahber: {
          bg: {
            dark: '#151311',
            light: '#F5EFE7',
          },
          surface: {
            dark: '#201D19',
            light: '#FFFDF8',
            elevatedDark: '#29251F',
            elevatedLight: '#F7F2E8',
          },
          gold: {
            DEFAULT: '#B89A5A',
            light: '#D3BA7E',
            dark: '#8E733D',
            subtle: 'rgba(184, 154, 90, 0.15)',
          },
          burgundy: {
            DEFAULT: '#6F2630',
            light: '#8C3542',
            dark: '#521921',
            subtle: 'rgba(111, 38, 48, 0.15)',
          },
          green: {
            DEFAULT: '#315C48',
            light: '#427A60',
            dark: '#224032',
            subtle: 'rgba(49, 92, 72, 0.15)',
          },
          ivory: '#F5EFE3',
          ink: '#2B241E',
          muted: {
            dark: '#9E9484',
            light: '#74695D',
          },
          border: {
            dark: 'rgba(184, 154, 90, 0.14)',
            light: 'rgba(116, 105, 93, 0.18)',
          }
        }
      },
      fontFamily: {
        ethiopic: ['"Noto Sans Ethiopic"', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'sacred-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.3), 0 1px 3px -1px rgba(184, 154, 90, 0.08)',
        'sacred': '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 6px -2px rgba(184, 154, 90, 0.12)',
        'candle-glow': '0 0 25px -5px rgba(184, 154, 90, 0.25)',
      }
    },
  },
  plugins: [],
}
