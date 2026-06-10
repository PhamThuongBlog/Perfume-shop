import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/naming-convention": "off",
      // Rule thực sự gây warn mixed ASCII/non-ASCII:
      "no-restricted-syntax": "off",
      "id-match": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
]);

export default eslintConfig;