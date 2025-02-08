const withTM = require('next-transpile-modules')(['monaco-editor']);
const withPWA = require('next-pwa')({ dest: 'public' });

module.exports = withTM(
  withPWA({
    reactStrictMode: true,
    // No custom Webpack rule needed for monaco-editor
  })
);
