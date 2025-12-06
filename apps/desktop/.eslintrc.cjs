/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react"],
  parserOptions: {
    tsconfigRootDir: __dirname
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  },
  ignorePatterns: ["dist", "node_modules", "src-tauri"]
};
