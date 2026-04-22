export default {
  testEnvironment:        'node',
  transform:              {},           // ESM nativo — sin Babel
  extensionsToTreatAsEsm: ['.js'],
  testMatch:              ['**/tests/**/*.test.js'],
  testTimeout:            30000,
  verbose:                true,
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',   // entry point — no se testea directamente
  ],
  coverageThreshold: {
    global: {
      lines:     70,
      functions: 70,
      branches:  60,
    },
  },
};
