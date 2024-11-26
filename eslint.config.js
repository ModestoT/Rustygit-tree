import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-plugin-prettier/recommended";
import pluginHooks from 'eslint-plugin-react-hooks';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  //taken from https://github.com/facebook/react/pull/30774. TODO: when this PR is published,
  //replace this with pluginHooks.configs['recommended-latest']
  {
    name: 'react-hooks/recommended',
    plugins: {
      'react-hooks': {
        meta: {
          name: 'eslint-plugin-react-hooks',
          version: '5.0.0'
        },
        rules: pluginHooks.rules
      }
    },
    rules: pluginHooks.configs.recommended.rules,
  },
  {
    ignores: ['node_modules', 'public', 'dist'],
  },
  eslintConfigPrettier,
  {
    settings: {
      'react': {
        'version': 'detect',
      }
    },
    rules: {
      'prettier/prettier': 'warn'
    }
  },
];