// The `lint` script has existed since the project was set up, but there was no
// config for it to read, so running it only ever produced an error. ESLint 8 is
// what is installed here, hence the .eslintrc rather than the flat config.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // The API error handlers narrow `unknown` by reading response.data.error,
    // which is not worth a type for every endpoint's failure shape.
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
