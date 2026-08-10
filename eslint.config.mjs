import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Architectural boundary rules — imports must flow downward only:
  //   app (routing) → feature (via index barrel) → shared UI / lib
  //   features may not import other features' internals
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app",     pattern: "src/app/**/*" },
        { type: "feature", pattern: "src/features/*/**/*", capture: ["featureName"] },
        { type: "shared",  pattern: "src/components/**/*" },
        { type: "lib",     pattern: "src/lib/**/*" },
        { type: "store",   pattern: "src/store/**/*" },
        { type: "hooks",   pattern: "src/hooks/**/*" },
        { type: "types",   pattern: "src/types/**/*" },
        { type: "styles",  pattern: "src/styles/**/*" },
        { type: "mocks",   pattern: "src/mocks/**/*" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      // Each feature may only be imported via its index.ts barrel from outside
      "boundaries/entry-point": ["warn", {
        default: "disallow",
        rules: [
          { target: ["feature"], allow: "index.ts" },
          // allow importing from same feature (internal use)
          { target: ["feature"], from: ["feature"], allow: "**/*", importKind: "type" },
        ],
      }],

      // Layer dependency rules
      "boundaries/element-types": ["warn", {
        default: "disallow",
        rules: [
          // app/ can import features (via barrel), shared, lib, store, hooks, types
          { from: ["app"], allow: ["feature", "shared", "lib", "store", "hooks", "types"] },
          // features can import shared, lib, hooks, types, and their own internals
          { from: ["feature"], allow: ["shared", "lib", "hooks", "types", "store"] },
          // a feature can import from the same feature (intra-feature)
          { from: ["feature"], allow: ["feature"], match: { featureName: "${from.featureName}" } },
          // shared components can import lib and hooks
          { from: ["shared"], allow: ["lib", "hooks", "types"] },
          // lib is a leaf — imports nothing from the app
          { from: ["lib"], allow: ["types"] },
          { from: ["store"], allow: ["types", "lib"] },
          { from: ["hooks"], allow: ["lib", "types"] },
          { from: ["mocks"], allow: ["feature", "shared", "lib", "types"] },
        ],
      }],
    },
  },
]);

export default eslintConfig;
