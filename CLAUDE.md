# CLAUDE.md

## Project

`@gfazioli/mantine-led` — This is the **GitHub template** used to bootstrap every Mantine Extensions component library. It contains a working LED component as a reference implementation. All 21 component repos in the ecosystem are cloned from this template and share its structure, build pipeline, and tooling.

Changes to shared files here (Shell, Footer, scripts, configs) must be propagated manually to all component repos.

## Commands

| Command | Purpose |
|---------|---------|
| `yarn build` | Build the npm package via Rollup |
| `yarn dev` | Start the Next.js docs dev server (port 9281) |
| `yarn test` | Full test suite (syncpack + prettier + typecheck + lint + jest) |
| `yarn jest` | Run only Jest unit tests |
| `yarn docgen` | Generate component API docs (docgen.json) |
| `yarn docs:build` | Build the Next.js docs site for production |
| `yarn docs:deploy` | Build and deploy docs to GitHub Pages |
| `yarn lint` | Run ESLint |
| `yarn prettier:write` | Format all files with Prettier |
| `yarn storybook` | Start Storybook dev server |
| `yarn clean` | Remove build artifacts |
| `yarn release:patch` | Bump patch version and deploy docs |
| `diny yolo` | AI-assisted commit (stage all, generate message, commit + push) |

> **Important**: After changing the public API (props, types, exports), always run `yarn clean && yarn build` before `yarn test`, because `yarn docgen` needs the fresh build output.

## Architecture

### Workspace Layout

Yarn workspaces monorepo with two workspaces: `package/` (npm package) and `docs/` (Next.js 15 documentation site).

### Package Source (`package/src/`)

The LED component is the canonical reference implementation:

- `Led.tsx` — Main component using `polymorphicFactory()` with Mantine's Styles API
- `Led.module.css` — CSS module with custom properties and data-attribute selectors
- `Led.test.tsx` — Jest tests using `@mantine-tests/core` render helper
- `Led.story.tsx` — Storybook stories
- `index.ts` — Public exports (component + types)

### Build Pipeline

Rollup bundles to dual ESM (`dist/esm/`) and CJS (`dist/cjs/`) with `'use client'` banner. CSS modules are hashed with `hash-css-selector` (prefix `me`). TypeScript declarations via `rollup-plugin-dts`. CSS is split into `styles.css` and `styles.layer.css` (layered version).

### Docs (`docs/`)

- `docs/data.ts` — Package metadata (name, description, repo URL, author)
- `docs/docs.mdx` — Main documentation content
- `docs/demos/` — Interactive demos using `@mantinex/demo`
- `docs/pages/index.tsx` — Assembles Shell, PageHeader, DocsTabs, and the MDX content
- `docs/styles-api/` — Styles API data for the documentation table
- `docs/docgen.json` — Auto-generated from TypeScript types (don't edit manually)

The `next.config.mjs` dynamically sets `basePath` from the repository field in `package/package.json`.

## Component Details

### Component Authoring Pattern

Every component follows Mantine's Styles API pattern. Use the LED component (`package/src/Led.tsx`) as the canonical reference:

1. **Factory type** — Define a `PolymorphicFactory` type specifying props, default element, stylesNames, variants, and CSS variables.
2. **Props interface** — Extend `BoxProps` + your base props + `StylesApiProps<YourFactory>`.
3. **Default props** — Declare a `defaultProps` partial object.
4. **CSS Variables resolver** — Use `createVarsResolver<YourFactory>()` to map props to CSS custom properties.
5. **Component body** — Use `polymorphicFactory()` with `useProps()` and `useStyles()` hooks. Render via Mantine's `Box` with `getStyles('partName')` and `mod` for data attributes.
6. **Attach classes** — Set `Component.classes = classes` and `Component.displayName`.

### CSS Modules (`Component.module.css`)

- Use CSS custom properties (`--component-*`) for all dynamic values
- Define sizes via `--component-size-{xs,sm,md,lg,xl}`
- Use `[data-attribute]` selectors for state/variant styling
- Animations go in `@keyframes` within the module

### Exports pattern (`package/src/index.ts`)

Export the component and its public types (base props, CSS variables type, factory type). Do not export internal types.

## Testing

Jest with `jsdom` environment, `esbuild-jest` transform, CSS mocked via `identity-obj-proxy`. Component tests use `@mantine-tests/core` render helper (not directly `@testing-library/react`).

Standard test coverage: renders without crashing, forwards ref, data attributes for props/variants/states.

## Ecosystem

This repo is the **template** for the Mantine Extensions ecosystem. See the workspace `CLAUDE.md` (in the parent directory) for:
- Development checklist (code → test → build → docs → release)
- Cross-cutting patterns (compound components, responsive CSS, GitHub sync)
- Update packages workflow
- Release process
