import antfu from '@antfu/eslint-config';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default antfu(
  {
    react: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Ignored paths
    ignores: ['dist', 'storybook-static', 'wrangler.jsonc'],
  },
  // --- Browser Globals ---
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- React Hooks Rules ---
  reactHooks.configs.flat.recommended,
  // --- E2E Testing Rules ---
  {
    files: ['**/*.spec.ts', '**/*.e2e.ts'],
  },
  // --- Prettier Rules ---
  eslintConfigPrettier,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  // --- Custom Rule Overrides ---
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'antfu/no-top-level-await': 'off', // Allow top-level await
      'node/prefer-global/process': 'off',
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
    },
  },
);
