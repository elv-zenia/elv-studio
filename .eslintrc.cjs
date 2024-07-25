module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    requireConfigFile: false,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    },
    babelOptions: {
      presets: ["@babel/preset-react"]
    }
  },
  settings: { react: { version: "detect" } },
  plugins: ["react-refresh"],
  rules: {
    "react-hooks/exhaustive-deps": 0,
    "react/prop-types": 0,
    "semi": ["error", "always"],
    "react-refresh/only-export-components": [
      'warn',
      { allowConstantExport: true },
    ],
    "no-console": [
      "error"
    ],
    "quotes": [
      "error",
      "double"
    ]
  },
}
