module.exports = {
  input: 'browser.js',
  output: {
    file: 'browser-build.js',
    format: 'iife',
    name: 'htmlsketch'
  },
  plugins: [
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-commonjs')()
  ]
};
