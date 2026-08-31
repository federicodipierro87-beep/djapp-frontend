/** @type {import('tailwindcss').Config} */

// Design system "editoriale nightlife": fondo nero piatto, un solo accento rosso,
// niente glow. Le scale di `borderRadius` e `boxShadow` sono ridefinite (non estese)
// di proposito: neutralizzano in un colpo solo tutti i `rounded-2xl` e le ombre
// colorate sparse nei componenti, senza doverli riscrivere uno per uno.

const systemSans = [
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
];

const systemMono = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Consolas',
  'Liberation Mono',
  'monospace',
];

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08080A',
          900: '#0E0E11',
          800: '#16161A',
          700: '#1F1F24',
          600: '#2C2C33',
          500: '#3D3D45',
        },
        bone: {
          DEFAULT: '#F5F4F0',
          dim: '#9C9A94',
          faint: '#6A6862',
        },
        live: {
          DEFAULT: '#FF3B1F',
          dim: '#B82C11',
        },
        ok: '#37D67A',
        warn: '#E0A32E',
      },
      fontFamily: {
        sans: ['Archivo Variable', ...systemSans],
        display: ['Archivo Variable', ...systemSans],
        mono: ['JetBrains Mono Variable', ...systemMono],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
    },

    // Scale ridefinite, non estese.
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '3px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      '2xl': '10px',
      '3xl': '12px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.6)',
      DEFAULT: '0 2px 6px -1px rgb(0 0 0 / 0.7)',
      md: '0 4px 12px -2px rgb(0 0 0 / 0.7)',
      lg: '0 10px 24px -6px rgb(0 0 0 / 0.75)',
      xl: '0 20px 40px -12px rgb(0 0 0 / 0.8)',
      '2xl': '0 28px 60px -20px rgb(0 0 0 / 0.85)',
      inner: 'inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
    },
  },
  plugins: [],
}
