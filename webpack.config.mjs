import WebExtPlugin from 'web-ext-plugin';

module.exports = {
  plugins: [new WebExtPlugin({ sourceDir: 'extension-dist' })],
};