import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'

/**
 * ESLint v9+ flat config for crevo-web.
 *
 * Layers, in order:
 *   - Next/Core Web Vitals: catches performance anti-patterns the Next
 *     team cares about (`<img>` instead of `next/image`, rogue `<head>`,
 *     missing `key`, navigation prefetch footguns). These are the rules
 *     whose violations show up in Lighthouse.
 *   - Next/TypeScript: narrows the rules to TS-appropriate types and
 *     layers in `@typescript-eslint/*`.
 *   - Local overrides below tighten or loosen specific rules where our
 *     usage pattern diverges from the preset's default.
 *
 * Scripts that generate PNG icons / favicons / logo paths live outside
 * the app and don't need linting; ignore to keep `next lint` fast.
 *
 * Run with `yarn lint` (aliased to `eslint .`).
 */
/**
 * Named const so `import/no-anonymous-default-export` doesn't flag the
 * config — anonymous default arrays are hard to identify in stack traces
 * and disable any tooling that relies on the export name.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'scripts/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Explicit-any is a legitimate escape hatch for some API payloads
      // (server responses not in our control); warn instead of error so
      // reviewers notice without blocking legit usage.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Accept the underscore-prefix convention for unused destructured
      // values (common in RHF form handlers).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // React 19's new React Compiler-aware rules. They flag legitimate
      // patterns (guard-then-setState in effects, localStorage-driven
      // hydration, ref mutations inside event handlers) that we can't
      // refactor in one shot without rewriting half the private pages.
      // Keep them at `warn` so they show up during review but don't
      // fail CI — we'll migrate pages to Compiler-friendly shapes
      // incrementally.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Apostrophes in Spanish prose trigger this rule constantly
      // ("¿Olvidaste tu contraseña?" etc.); we already escape where
      // it matters (JSX text vs attributes), so the rule is noise.
      'react/no-unescaped-entities': 'off',
    },
  },
  // Turn off every stylistic rule that Prettier already handles. Must be
  // the last entry in the array so it overrides the presets above.
  prettierConfig,
]

export default config
