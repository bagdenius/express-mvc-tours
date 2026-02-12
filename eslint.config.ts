import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**/*', 'node_modules/**/*'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|request|response|next|error',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.ts'],
    ...vitest.configs.recommended,
  },
  eslintPluginPrettierRecommended,
]);
