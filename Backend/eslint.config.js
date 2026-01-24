const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,

  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".env",
      ".env.local",
      "*.log",
    ],
  },

  // ESLint rules for source files
  {
    files: ["src/**/*.js", "**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      // Uncomment to disable unused-vars warnings if CI fails
      // "no-unused-vars": "off",
      "no-console": "warn",
    },
  },
];
