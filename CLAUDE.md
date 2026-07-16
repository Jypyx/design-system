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

1. **Base / primitives** — [src/styles/tokens/base/](src/styles/tokens/base/) (`colors.css`, `spacing.css`, `radius.css`, `shadow.css`, `typography.css`, `motion.css`). Tailwind 4-inspired naming (`--color-blue-500`, `--spacing-4`, `--radius-md`, `--text-sm`, `--duration-150`, `--ease-out`), colors in oklch. **Only the color primitives are off-limits to components** — every component color must route through the semantic layer (that is where light/dark is resolved). Non-color primitives (spacing, radius, typography, shadow, motion) are legitimately consumed by component tokens directly.
2. **Semantic** — [src/styles/tokens/semantic/theme.css](src/styles/tokens/semantic/theme.css) (`--surface`, `--text`, `--border`, `--color-primary/success/danger/warning` + `--color-on-*`, `--color-warning-text` — amber pulled toward the text color for readable tonal/outlined/text usages —, `--focus-ring`). **The only file where `light-dark()` appears** — dark mode is resolved entirely here. [semantic/sizing.css](src/styles/tokens/semantic/sizing.css) adds the shared control scales: `--control-height-*` (28/36/44/52), `--control-icon-*` (16/20/20/24) and `--control-square-*` (20/26/32/38/42, Badge/Chip); component size ramps must alias these instead of re-typing px.
3. **Component** — a `<name>.tokens.css` file next to each component (e.g. `--btn-height`, `--btn-accent`). Colors come from semantic tokens only; light/dark comes for free. Filled looks use the `--<comp>-accent` / `--<comp>-on-accent` / `--<comp>-tint` vocabulary (Button, Badge, Chip, Avatar, Tabs, Toggle…). For arbitrary user colors, the sanctioned auto-contrast recipe is `oklch(from var(--<comp>-accent) clamp(0, (0.62 - l) * infinity, 1) 0 h)` (black-or-white content by lightness — see badge/chip/avatar).

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

- `<ComponentName>.vue` — SFC; script is only `withDefaults(defineProps<Props>())` + imports of the tokens file and any shared partials/composables (see "Shared code" below); props are exposed as `data-*` attributes on the root element; unscoped `<style>` namespaced under the `ds-` class prefix (e.g. `.ds-btn`)
- `<name>.tokens.css` — Layer 3 tokens; variant/size/color selectors (`[data-size='xs']`, `[data-color='primary']`) only redefine custom properties
- `<ComponentName>.types.ts` — exported prop/union types
- `<ComponentName>.stories.ts` — Storybook CSF3 stories

New components are re-exported from [src/components/index.ts](src/components/index.ts).

Conventions:

- Variant/state logic belongs in CSS selectors, not in computed classes or TS
- Derive hover/active shades and tonal backgrounds with `color-mix(in oklab, …)` rather than adding new color tokens
- Overlays (modals, tooltips, menus, dropdowns) must use the native **Popover API** — no positioning/overlay JS libraries
- Loading states use the **Spinner** component (`<Spinner class="ds-x-spinner" />`, sized via `--spinner-size` — hosts alias their icon-size token onto it; color rides on `currentColor`) — never an inline SVG
- Naming note: Toggle's `'flat'` variant names its _pressed_ fill recipe (state pair), not Button's resting `flat` fill — the overlap is accepted and documented in `Toggle.types.ts`

## Shared code (cross-component reuse)

Two opt-in locations hold everything used by more than one component; **never copy-paste between components**:

- [src/components/shared/](src/components/shared/) — shared TS, importable from any SFC (kept under `src/components/` so vite-plugin-dts emits its `.d.ts`):
  - `types.ts` — `Size`, `SemanticColor`, `LabelPosition`, `Placement`; per-component unions alias them (`ButtonSize = Size`) so exported names stay stable. Badge/Chip/Toast sizes stay local (different px scales).
  - `utils.ts` (`iconProps`, `fold`), `colors.ts` (`SEMANTIC_COLORS`, `isSemanticColor`)
  - `use-anchor.ts` (anchor-name/id wiring), `use-popover-toggle.ts` (the pointerdown/click light-dismiss dance), `arrow-nav.ts` (`resolveArrowNav` wrap-around list navigation + `horizontalArrowKeys` RTL swap; clamped grids like Calendar stay hand-rolled)
- [src/styles/shared/](src/styles/shared/) — CSS partials, imported per-SFC like a tokens file (`import '../../styles/shared/x.css'`), so they land in `dist/styles.css` without any global stylesheet:
  - `popover.css` (`.ds-popover`), `field.css` (`.ds-field`, `-frame`, `-control`, `-label`, `-meta`, `-hint`, `-count`, `-required`), `option.css` (`.ds-option`), `icon-button.css` (`.ds-icon-btn`), `sr-only.css` (`.ds-sr-only`)

Rules for the CSS partials:

- Role classes are **additive** next to the component's own class (`class="ds-input-field ds-field-frame"`); the `ds-<comp>-*` class always stays (cross-component selectors and theming depend on it)
- Structural rules in partials are wrapped in `:where()` (zero specificity) so any component rule overrides them **regardless of bundle order** (Storybook dev and the lib build concatenate CSS differently). Corollary: a component must not redeclare a property the partial's _state_ rules animate (e.g. a `background-color` reset would sit above the `:where()` washes — such resets live in the partial's base rule)
- Components parameterize a partial through its custom properties (`--field-*`, `--popover-*`, `--option-*`, `--icon-btn-*`), mapped in their `*.tokens.css` (e.g. `--field-surface: var(--input-surface)`)
- Typography overrides that must beat `typography.tokens.css` `[data-variant]` rules (0,2,0) are written at (0,3,0) — see `field.css`'s label/hint rules
