const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Only utils.js has unit tests today — the DOM-driving code inside
      // alaska-2026-planner.html's inline <script> isn't covered (see
      // CLAUDE.md), so it's excluded rather than dragging the numbers down.
      include: ['utils.js'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
