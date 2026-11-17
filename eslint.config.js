import js from "@eslint/js"
import { vueTsConfigs, withVueTs } from "@vue/eslint-config-typescript"
import prettier from "eslint-config-prettier/flat"
import vue from "eslint-plugin-vue"
import { globalIgnores } from "eslint/config"
import globals from "globals"

export default withVueTs(
  globalIgnores(["dist", "eslint.config.js"]),
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: { globals: globals.browser },
  },
  js.configs.recommended,
  // The full Vue style guide, not only its error-prevention tier:
  // https://vuejs.org/style-guide/
  vue.configs["flat/recommended"],
  // Type-aware rules catch what syntax alone can't: un-awaited promises,
  // `any` leaking through, conditions that are always true. They cover
  // the expressions inside <template> as well as the scripts.
  vueTsConfigs.recommendedTypeChecked,
  {
    rules: {
      // An optional prop's type already says it may be undefined, so a
      // default for each one adds nothing in TypeScript.
      "vue/require-default-prop": "off",
    },
  },
  {
    // The shadcn-vue primitives keep the names its CLI gives them
    // (Button, Card, Input), so `shadcn-vue add` can update them in place.
    files: ["src/components/ui/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    // Test helpers and tests define small throwaway components inline.
    files: ["src/test/**/*.ts", "**/*.test.ts"],
    rules: {
      "vue/one-component-per-file": "off",
    },
  },
  // Prettier owns formatting, so the layout rules above are switched off.
  prettier
)
