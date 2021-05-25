module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  extends: [
    // 'eslint:recommended',
    // 'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  parser: 'babel-eslint',
  plugins: ['react'],
  rules: {
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ['TemplateLiteral'],
      },
    ],
    quotes: ['error', 'single'],
    'jsx-a11y/anchor-is-valid': ['off'],
    'jsx-a11y/anchor-has-content': ['off'],
  },
};
