module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier', // Usa la configuración de Prettier para desactivar reglas de ESLint conflictivas
    'plugin:prettier/recommended', // Habilita eslint-plugin-prettier y eslint-config-prettier
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Puedes añadir reglas personalizadas aquí
  },
};