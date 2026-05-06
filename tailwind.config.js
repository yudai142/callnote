module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/javascript/**/*.jsx',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color Tokens
        primary: '#4648d4',
        'on-primary': '#ffffff',
        'primary-container': '#6063ee',
        'on-primary-container': '#fffbff',
        'primary-fixed': '#e1e0ff',
        'primary-fixed-dim': '#c0c1ff',
        'on-primary-fixed': '#07006c',
        'on-primary-fixed-variant': '#2f2ebe',
        secondary: '#b4136d',
        'on-secondary': '#ffffff',
        'secondary-container': '#fd56a7',
        'on-secondary-container': '#600037',
        'secondary-fixed': '#ffd9e4',
        'secondary-fixed-dim': '#ffb0cd',
        'on-secondary-fixed': '#3e0022',
        'on-secondary-fixed-variant': '#8c0053',
        tertiary: '#904900',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#b55d00',
        'on-tertiary-container': '#fffbff',
        'tertiary-fixed': '#ffdcc5',
        'tertiary-fixed-dim': '#ffb783',
        'on-tertiary-fixed': '#301400',
        'on-tertiary-fixed-variant': '#703700',
        surface: '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-dim': '#d0dbed',
        'surface-variant': '#d9e3f6',
        'surface-tint': '#494bd6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e6eeff',
        'surface-container-high': '#dee9fc',
        'surface-container-highest': '#d9e3f6',
        'on-surface': '#121c2a',
        'on-surface-variant': '#464554',
        'inverse-surface': '#27313f',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#c0c1ff',
        background: '#f8f9ff',
        'on-background': '#121c2a',
        outline: '#767586',
        'outline-variant': '#c7c4d7',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      }
    }
  },
  plugins: []
}
