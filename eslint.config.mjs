import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/extension/**/*.ts", "apps/web/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["apps/api/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/api/**/*.ts", "packages/**/*.ts"],
    rules: { "no-undef": "error" },
  },
);
