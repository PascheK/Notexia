const path = require("node:path");
const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = [
  {
    ignores: ["dist", "node_modules", "src-tauri"]
  },
  ...compat.extends("@repo/eslint-config/react"),
  ...compat.config({
    parserOptions: {
      tsconfigRootDir: __dirname
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: path.join(__dirname, "tsconfig.json")
        }
      }
    }
  })
];
