const withTM = require('next-transpile-modules')(['monaco-editor']);
const withPWA = require('next-pwa');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = withTM(
  withPWA({
    pwa: {
      dest: 'public',
      disable: !isProduction, // Disable PWA in development to avoid the warnings
      register: true,
      skipWaiting: true,
    },
    reactStrictMode: true,
    // No custom Webpack rule needed for monaco-editor
  })
);
