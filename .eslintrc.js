module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint: recommended',
    'plugin:react/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/recommended',
    'plugin:testing-library/react',
    'plugin:@typescript-eslint/recommended'
  ],
  settings: {
    react: { version: 'detect' }
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint', 'jest-dom', 'testing-library'],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'import/no-webpack-loader-syntax': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'warn',
    'react/prop-types': 'off'
  }
}
