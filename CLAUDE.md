# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Vue 3 + TypeScript design system, published as an npm package and developed/showcased through Storybook (there is no app shell — Storybook is the only dev environment). Guiding principle: **CSS and HTML over TypeScript** — all styling logic (variants, sizes, colors, theming) lives in CSS; TypeScript is limited to prop types and minimal component scripts.

## Commands

- `npm run storybook` — dev environment (Storybook on port 6006); this is the primary way to work on components
- `npm run build` — typecheck (`vue-tsc -b`) + Vite **library build** to `dist/` (ESM + d.ts via vite-plugin-dts, `vue` external); use this to verify TypeScript
- `npm run build-storybook` — static Storybook build
- `npx vitest run --project=storybook` — renders every story in headless Chromium with a11y checks (via @storybook/addon-vitest); run twice if the first run fails with "Vite unexpectedly reloaded a test" (dep re-optimization flake)
- Single component's stories: `npx vitest run --project=storybook src/components/button/Button.stories.ts`

## Token architecture (3 layers)

All design tokens are **CSS custom properties** — never TypeScript constants.

1. **Base / primitives** — [src/styles/tokens/base/](src/styles/tokens/base/) (`colors.css`, `spacing.css`, `radius.css`, `shadow.css`, `typography.css`, `motion.css`). Tailwind 4-inspired naming (`--color-blue-500`, `--spacing-4`, `--radius-md`, `--text-sm`, `--duration-150`, `--ease-out`), colors in oklch. Components must never reference these directly.
2. **Semantic** — [src/styles/tokens/semantic/theme.css](src/styles/tokens/semantic/theme.css) (`--surface`, `--text`, `--border`, `--color-primary/success/danger/warning` + `--color-on-*`, `--focus-ring`). **The only layer where `light-dark()` appears** — dark mode is resolved entirely here.
3. **Component** — a `<name>.tokens.css` file next to each component (e.g. `--btn-height`, `--btn-accent`). Consumes semantic tokens only; light/dark comes for free.

Theming: `color-scheme: light dark` on `:root` follows the OS; `data-theme="light" | "dark"` on `<html>` forces a theme (zero JS). The Storybook toolbar "Theme" switcher sets this attribute (see [.storybook/preview.ts](.storybook/preview.ts)).

Entry point: both the library entry `src/index.ts` and `.storybook/preview.ts` import [src/styles/tokens/index.css](src/styles/tokens/index.css). **There is no reset/global stylesheet and none may be added** — consumers keep their own global styles. Consequently, components must be self-contained and never assume host styles (declare `box-sizing`, `margin`, fonts, etc. themselves — see `.ds-btn`). The only global styling lives in [.storybook/preview.css](.storybook/preview.css), which is Storybook canvas decoration, not part of the design system.

## Package consumption

`src/index.ts` is the library entry. Consumers do:

```ts
import { Button } from 'design-system'
import 'design-system/styles.css' // tokens + component styles, single file (no reset)
```

Package exports live in [package.json](package.json) (`.` → `dist/index.js` + types, `./styles.css` → `dist/styles.css`); `vue` is a peerDependency. New public components/types must be re-exported from `src/components/index.ts` to reach the bundle.

## Component pattern

Each component lives in `src/components/<name>/` with exactly four files (see `button/` as the reference):

- `<ComponentName>.vue` — SFC; script is only `withDefaults(defineProps<Props>())` + an import of the tokens file; props are exposed as `data-*` attributes on the root element; unscoped `<style>` namespaced under the `ds-` class prefix (e.g. `.ds-btn`)
- `<name>.tokens.css` — Layer 3 tokens; variant/size/color selectors (`[data-size='xs']`, `[data-color='primary']`) only redefine custom properties
- `<ComponentName>.types.ts` — exported prop/union types
- `<ComponentName>.stories.ts` — Storybook CSF3 stories

New components are re-exported from [src/components/index.ts](src/components/index.ts).

Conventions:

- Variant/state logic belongs in CSS selectors, not in computed classes or TS
- Derive hover/active shades and tonal backgrounds with `color-mix(in oklab, …)` rather than adding new color tokens
- Overlays (modals, tooltips, menus, dropdowns) must use the native **Popover API** — no positioning/overlay JS libraries
