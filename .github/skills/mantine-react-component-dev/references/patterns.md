# Component Patterns Quick Reference

Direct links to **concrete implementations** in this project's codebase. These serve as reference examples showing how to apply the generic patterns described in SKILL.md.

> **Note**: References to specific components (like `Flip`, `FlipTarget`) point to actual implementation files in this project. Use them as real-world examples, not as literal templates to copy.

## Component Factory Pattern

**Reference Implementation**: [`/package/src/Flip.tsx`](../../../package/src/Flip.tsx)

Key sections:
- Lines 1-11: Imports from `@mantine/core`
- Lines 18-30: Type definitions (`StylesNames`, `CssVariables`, `Props`, `Factory`)
- Lines 80-95: Default props and vars resolver
- Lines 97+: Component implementation with `polymorphicFactory`

## Context Pattern

**Reference Implementation**: [`/package/src/Flip.context.ts`](../../../package/src/Flip.context.ts)

Generic pattern:
```typescript
import { createSafeContext } from '@mantine/core';

interface MyContext {
  state: boolean;
  setState: (value: boolean) => void;
}

export const [MyContextProvider, useMyContext] = createSafeContext<MyContext>(
  ERROR_MESSAGE
);
```

**Error Constants**: See [`/package/src/Flip.errors.ts`](../../../package/src/Flip.errors.ts) for example.

## Compound Components

**Reference Implementation**: [`/package/src/FlipTarget/FlipTarget.tsx`](../../../package/src/FlipTarget/FlipTarget.tsx)

Key principles:
- Uses `forwardRef` for ref forwarding
- Accesses parent context with `useContext` hook
- Uses `createEventHandler` for event composition
- Validates children with `isElement`

## CSS Modules

**Reference Implementation**: [`/package/src/Flip.module.css`](../../../package/src/Flip.module.css)

Generic pattern:
- CSS custom properties from `varsResolver`
- Scoped class names (`.root`, `.element`)
- Data attribute selectors for state (`[data-active]`)

## Styles API Metadata

**Reference Implementation**: [`/docs/styles-api/Flip.styles-api.ts`](../../../docs/styles-api/Flip.styles-api.ts)

Generic structure:
```typescript
export const ComponentStylesApi: StylesApiData<Factory> = {
  selectors: { root: 'Description', element: 'Description' },
  vars: { root: { '--var-name': 'Description' } },
  modifiers: [{ modifier: 'data-state', selector: 'root', condition: 'When...' }],
};
```

## Testing Patterns

**Reference Implementation**: [`/package/src/Flip.test.tsx`](../../../package/src/Flip.test.tsx)

Key imports:
```typescript
import { render } from '@mantine-tests/core';
import '@testing-library/jest-dom';
```

Basic test structure:
- `render(<Component />)` returns `{ container, getByRole, ... }`
- Use `expect(container).toBeTruthy()` for smoke tests
- Query with Testing Library queries (`getByRole`, `getByText`)

## Documentation Demos

**Demo Examples**: [`/docs/demos/`](../../../docs/demos/)

Files:
- `Component.demo.basic.tsx`: Simple usage example
- `Component.demo.configurator.tsx`: Interactive props configurator
- `Component.demo.controlled.tsx`: Controlled state example

Demo export format:
```typescript
export const demoName: MantineDemo = {
  type: 'code', // or 'configurator'
  component: DemoComponent,
  code: `...source code string...`,
};
```

## MDX Documentation

**Main Docs**: [`/docs/docs.mdx`](../../../docs/docs.mdx)

Components used:
- `<InstallScript packages="..." />`: NPM/Yarn install commands
- `<Demo data={demos.name} />`: Render demo
- `<PropsTable component="Name" />`: Auto-generated props table
- `<StylesApiTable component="Name" />`: Styles API reference

## Build Configuration

**Rollup Config**: [`/rollup.config.mjs`](../../../rollup.config.mjs)

Key features:
- Dual output: ESM (`.mjs`) and CJS (`.cjs`)
- PostCSS with CSS modules (hashed class names)
- TypeScript compilation with `esbuild`
- External dependencies via `rollup-plugin-node-externals`
- Source maps enabled
- `'use client'` banner for non-index files

## TypeScript Configuration

**Main Config**: [`/tsconfig.json`](../../../tsconfig.json)

Settings:
- Target: ES2015
- Module: ESNext with Node resolution
- JSX: React (classic runtime)
- Declaration output to `package/dist/types`

**Build Config**: [`/tsconfig.build.json`](../../../tsconfig.build.json)
- Isolates build-specific includes/excludes

## Linting & Formatting

**ESLint**: [`/eslint.config.mjs`](../../../eslint.config.mjs)
- Extends `eslint-config-mantine`
- Ignores: `.next/`, `*.{mjs,cjs,js,d.ts,d.mts}`

**Prettier**: [`/.prettierrc.mjs`](../.prettierrc.mjs)
- 100 character print width
- Single quotes, ES5 trailing commas
- Import sorting with `@ianvs/prettier-plugin-sort-imports`
