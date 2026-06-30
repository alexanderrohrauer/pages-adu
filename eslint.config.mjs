import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party UI component library — not ours to lint
    "components/ai-elements/**",
  ]),
  {
    rules: {
      // React Compiler compatibility rules — require major refactoring of existing
      // editor components (toolbar, text-editor, sheet-editor). Disabled until a
      // dedicated React Compiler migration is done.
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
