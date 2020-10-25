module.exports = {
  extends: [
    'standard',
    'prettier',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'react/prop-types': 'off',
  },
  plugins: ['react'],
  globals: {
    fetch: false,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
