---
name: verify
description: Verify a component change by driving Storybook with Playwright (build, launch, drive, screenshot)
---

# Verifying changes in this design system

The only runtime surface is Storybook — there is no app shell.

## Build / launch

- `npm run build` — typecheck + library build (CI-style, not verification)
- `npm run storybook -- --no-open` — dev server on http://localhost:6006 (run in background; ready in ~10s)

## Drive

Playwright is a devDependency (its Chromium is recent: anchor positioning,
scroll-state container queries, `closedby` all supported). Drive stories
directly through the canvas iframe, bypassing the manager UI:

```
http://localhost:6006/iframe.html?id=<story-id>&viewMode=story
```

Story ids derive from the CSF title: `Components/Dialog` + export
`ScrollableContent` → `components-dialog--scrollable-content`.

Gotchas learned:

- A verification script living outside the repo (scratchpad) can't resolve
  `playwright` — use `createRequire('file:///D:/Dev/design-system/package.json')('playwright')`.
- Stories with a `play` function self-open their overlay in story view;
  wait for the resulting state (e.g. `dialog[open]`) instead of clicking
  the trigger, and fall back to clicking if it doesn't appear.
- Overlay enter/exit transitions are 150ms — wait ~300–400ms after an
  open/close action before asserting.
- Force themes for visual checks with
  `document.documentElement.dataset.theme = 'dark' | 'light'`.
- Pseudo-element styles (scroll edges etc.) are assertable via
  `getComputedStyle(el, '::before')` in `page.evaluate`.

## Worth driving for overlay components

Open/close through every path (trigger, Escape, backdrop, close button),
focus behavior (Tab cycling), small viewport (~360×600), dark theme,
and any scroll-dependent styling (check with content that overflows AND
content that doesn't).
