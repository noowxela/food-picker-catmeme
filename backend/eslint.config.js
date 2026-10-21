const { builtinRules } = require('eslint/use-at-your-own-risk');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const jest = require('eslint-plugin-jest');
const security = require('eslint-plugin-security');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// eslint-config-airbnb-base only ships a legacy (eslintrc) config, so load its rule sets directly.
// Rules that no longer exist in ESLint core are skipped so the config keeps working on ESLint 10.
const airbnbRuleSets = ['best-practices', 'errors', 'node', 'style', 'variables', 'es6', 'imports', 'strict'].map((name) =>
  // eslint-disable-next-line global-require, import/no-dynamic-require, security/detect-non-literal-require
  require(`eslint-config-airbnb-base/rules/${name}`),
);
const airbnbRules = Object.fromEntries(
  airbnbRuleSets
    .flatMap((set) => Object.entries(set.rules))
    .filter(([rule]) => rule.startsWith('import/') || builtinRules.has(rule)),
);
const airbnbImportSettings = airbnbRuleSets.find((set) => set.settings).settings;

module.exports = [
  {
    ignores: ['node_modules/**', 'bin/**', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: airbnbImportSettings,
    rules: airbnbRules,
  },
  jest.configs['flat/recommended'],
  security.configs.recommended,
  prettierRecommended,
  {
    rules: {
      'no-console': 'error',
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'jest/expect-expect': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  {
    // The ESLint config itself only loads dev tooling.
    files: ['eslint.config.js'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true, ignore: ['^eslint/use-at-your-own-risk$'] }],
    },
  },
];
