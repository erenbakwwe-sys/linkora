const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
};
