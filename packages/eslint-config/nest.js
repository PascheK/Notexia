const base = require("./base");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...base,
  env: {
    ...base.env
  },
  rules: {
    ...base.rules
    // ici tu peux ajouter des règles spécifiques Nest si tu veux
  }
};