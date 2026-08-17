const js = require('@eslint/js');
const html = require('eslint-plugin-html');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  // The inline <script> in the HTML files is extracted by eslint-plugin-html
  // into a virtual, in-memory "file" that only exists for the duration of the
  // lint run — there's no real file on disk for TypeScript's type-aware
  // linting to resolve through tsconfig's `include`, so this stays on plain
  // (non type-checked) linting.
  {
    files: ['**/*.html'],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        L: 'readonly',
        // Provided by utils.js, loaded via <script src="utils.js"> before the inline script.
        money: 'readonly',
        esc: 'readonly',
        groupCatFor: 'readonly',
        budgetTotals: 'readonly',
        gaugePercent: 'readonly',
        budgetVerdict: 'readonly',
        buildRouteUrl: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Root tooling/config scripts — build glue, not app source, so plain
  // (non type-checked) linting is enough here.
  {
    files: ['eslint.config.js', 'vitest.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  // Strict, type-checked linting for the actual app logic (utils.js) and its
  // tests. Types come from JSDoc annotations in utils.js, checked via
  // tsconfig.json's `checkJs`; typescript-eslint's strict-type-checked rules
  // then run on top of that type information.
  {
    files: ['utils.js', 'tests/**/*.js'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
  }
);
