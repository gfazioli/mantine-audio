# References Index

This directory contains curated links to existing project documentation and code examples. All references point to files within the project—no external templates or duplicated content.

## Core Documentation

- **[Main README](../../../README.md)**: Project overview, installation, and basic usage
- **[Contributing Guide](../../../CONTRIBUTING.md)**: Bug reporting and contribution process
- **[Code of Conduct](../../../CODE_OF_CONDUCT.md)**: Community guidelines

## Component Source Code

All components follow consistent patterns found in:

- **[`/package/src/`](../../../package/src/)**: Main component implementations
  - Component definition (`.tsx`)
  - Scoped styles (`.module.css`)
  - Context providers (`.context.ts`)
  - Error constants (`.errors.ts`)
  - Tests (`.test.tsx`)
  - Storybook stories (`.story.tsx`)

Example component for reference:
- **[Flip Component](../../../package/src/Flip.tsx)**: Full implementation of polymorphic factory pattern
- **[Flip Context](../../../package/src/Flip.context.ts)**: Safe context pattern example
- **[Flip Target Sub-component](../../../package/src/FlipTarget/FlipTarget.tsx)**: Compound component pattern
- **[Flip Styles](../../../package/src/Flip.module.css)**: CSS modules with custom properties
- **[Flip Tests](../../../package/src/Flip.test.tsx)**: Testing Library patterns

## Documentation Site

Next.js documentation site structure:

- **[`/docs/`](../../../docs/)**: Documentation source
  - **[Main Docs](../../../docs/docs.mdx)**: Primary documentation page
  - **[Demos](../../../docs/demos/)**: Interactive component demonstrations
  - **[Styles API](../../../docs/styles-api/)**: Component styling metadata
  - **[Components](../../../docs/components/)**: Doc site custom components

Key documentation components:
- **[PropsTable](../../../docs/components/PropsTable/)**: Auto-generated props documentation
- **[StylesApiTable](../../../docs/components/StylesApiTable/)**: Styles API reference tables
- **[InstallScript](../../../docs/components/InstallScript/)**: Package installation snippets

## Configuration Files

### TypeScript

- **[tsconfig.json](../../../tsconfig.json)**: Primary TypeScript configuration
- **[tsconfig.build.json](../../../tsconfig.build.json)**: Build-specific settings
- **[tsconfig.eslint.json](../../../tsconfig.eslint.json)**: ESLint-specific settings

### Linting & Formatting

- **[eslint.config.mjs](../../../eslint.config.mjs)**: ESLint configuration (extends `eslint-config-mantine`)
- **[.prettierrc.mjs](../../../.prettierrc.mjs)**: Prettier configuration with import sorting

### Build & Tooling

- **[rollup.config.mjs](../../../rollup.config.mjs)**: Rollup bundler configuration
- **[jest.config.cjs](../../../jest.config.cjs)**: Jest testing configuration
- **[vite.config.ts](../../../vite.config.ts)**: Vite configuration for Storybook
- **[postcss.config.js](../../../postcss.config.js)**: PostCSS configuration

### Package Management

- **[package.json](../../../package.json)**: Root workspace configuration
- **[package/package.json](../../../package/package.json)**: Published package configuration
- **[docs/package.json](../../../docs/package.json)**: Documentation site dependencies

## Scripts

Build and development scripts in [`/scripts/`](../../../scripts/):

- **[docgen.ts](../../../scripts/docgen.ts)**: Generate component API documentation
- **[generate-dts.ts](../../../scripts/generate-dts.ts)**: Generate TypeScript declarations
- **[prepare-css.ts](../../../scripts/prepare-css.ts)**: Process CSS for distribution
- **[release.ts](../../../scripts/release.ts)**: Version bump and release workflow
- **[update-version.ts](../../../scripts/update-version.ts)**: Update package versions

## Type Definitions

- **[@types/overrides.d.ts](../../../@types/overrides.d.ts)**: Global type augmentations

## Development Workflow

Quick reference for common development tasks:

```bash
# Install dependencies
yarn install

# Start development server (docs site)
npm run dev

# Run tests
npm run test

# Format code
npm run prettier:write

# Lint code
npm run lint

# Type check
npm run typecheck

# Build package
npm run build

# Build docs
npm run docs:build
```

See root [package.json scripts](../../../package.json) for complete list.

## External Resources

Mantine documentation (external):
- **Polymorphic Components**: https://mantine.dev/guides/polymorphic/
- **Styles API**: https://mantine.dev/styles/styles-api/
- **Testing**: https://mantine.dev/guides/testing/

React TypeScript best practices:
- **React TypeScript Cheatsheet**: https://react-typescript-cheatsheet.netlify.app/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
