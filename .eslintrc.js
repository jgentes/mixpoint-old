module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended'],
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
  plugins: ['react', 'html', '@typescript-eslint'],
  ignorePatterns: ['/airframe'],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'import/no-webpack-loader-syntax': 'off',
    'no-unused-vars': 'warn'
  },
  }
}
