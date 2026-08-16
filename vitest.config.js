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
      // 80% is the common industry default (Istanbul/nyc's out-of-the-box
      // threshold) rather than a project-specific target.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
