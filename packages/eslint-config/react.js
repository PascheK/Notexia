const base = require("./base");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...base,
  env: {
    ...base.env,
    browser: true
  },
  plugins: [...base.plugins, "react", "react-hooks"],
  extends: [
    ...base.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};