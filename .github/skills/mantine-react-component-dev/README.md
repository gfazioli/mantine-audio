# Mantine React Component Development Skill

A portable, generic Agent Skill for day-to-day development of React component libraries built with Mantine UI, TypeScript, and modern tooling.

## What This Skill Covers

This skill provides comprehensive guidance for:

- **Component Architecture**: Mantine's polymorphic factory pattern, compound components, context-based state management
- **TypeScript Best Practices**: Type-safe props, CSS variables, strict typing without `any`
- **Styles API**: Configurable styling system with selectors, CSS custom properties, and modifiers
- **Testing**: Jest + Testing Library patterns for component testing
- **Documentation**: MDX-based docs with interactive demos and API tables
- **Accessibility**: ARIA patterns, keyboard navigation, focus management
- **Code Quality**: ESLint, Prettier, type checking, and pre-commit validation

## When to Use This Skill

Apply this skill when:

- Creating new React components following Mantine patterns
- Editing existing components to add features or fix issues
- Implementing type-safe component APIs with TypeScript
- Configuring component styling through the Styles API
- Writing tests for component behavior and accessibility
- Documenting components with demos and API references
- Reviewing code for consistency with project standards
- Troubleshooting TypeScript, ESLint, or build issues

**Not for**: Build configuration, CI/CD pipelines, deployment, or infrastructure tasks.

## Skill Structure

```
mantine-react-component-dev/
├── SKILL.md                 # Main skill instructions and patterns
├── README.md                # This file
└── references/
    ├── README.md            # Index of project documentation
    ├── patterns.md          # Quick reference to code patterns
    ├── typescript.md        # TypeScript type safety guide
    └── accessibility.md     # ARIA and a11y guidelines
```

## Quick Start

The skill is organized into focused sections:

1. **[SKILL.md](./SKILL.md)**: Main reference with component patterns, coding standards, and workflows
2. **[references/](./references/)**: Deep-dive guides on specific topics

### Key References

- **[Patterns Quick Reference](./references/patterns.md)**: Direct links to example code
- **[TypeScript Guide](./references/typescript.md)**: Type safety patterns and best practices
- **[Accessibility Guide](./references/accessibility.md)**: ARIA patterns and keyboard navigation
- **[Project Index](./references/README.md)**: Links to all configuration and source files

### Understanding References to Specific Components

Throughout this skill, you'll see references to specific components like `Flip`, `FlipTarget`, etc. These are **concrete implementation examples** from this project, not generic templates to copy literally.

**How to use them:**
- ✅ Study the patterns and structure
- ✅ Understand how Mantine APIs are used
- ✅ Adapt the concepts to your component
- ❌ Don't copy-paste without understanding
- ❌ Don't use "Flip" as your component name

For example, when you see:
> **Reference Implementation**: [`/package/src/Flip.tsx`](../package/src/Flip.tsx)

This means: "Look at this real file to see how the pattern is actually implemented in practice."

## Core Principles

This skill emphasizes:

1. **Type Safety**: Explicit typing, avoiding `any`, using `unknown` with narrowing
2. **Component Composition**: Polymorphic components, compound components, context patterns
3. **Accessibility First**: Semantic HTML, ARIA attributes, keyboard navigation
4. **Progressive Disclosure**: Self-contained main skill file; references loaded on-demand
5. **Consistency**: Following established project patterns and conventions

## Development Workflow

Typical workflow when using this skill:

1. **Review Existing Patterns**: Check [`references/patterns.md`](./references/patterns.md) for similar implementations
2. **Follow Type Safety**: Use [`references/typescript.md`](./references/typescript.md) for type definitions
3. **Implement Accessibility**: Apply patterns from [`references/accessibility.md`](./references/accessibility.md)
4. **Write Tests**: Follow testing patterns in existing test files
5. **Document**: Create demos and update Styles API metadata
6. **Validate**: Run `npm run test` (includes prettier, typecheck, lint, jest)

## Technology Stack

Components built with this skill use:

- **React**: 18.x or 19.x (with TypeScript)
- **Mantine UI**: 7.x+ (`@mantine/core`, `@mantine/hooks`)
- **TypeScript**: Strict mode with ES2015 target
- **CSS Modules**: Scoped styles with PostCSS
- **Testing**: Jest + Testing Library
- **Documentation**: Next.js + MDX (Nextra)
- **Build**: Rollup (dual ESM/CJS output)
- **Linting**: ESLint (mantine config) + Prettier

## Portability

This skill is designed to be generic and reusable. It:

- Contains NO project-specific names or proprietary identifiers
- References existing code with relative links (portable across similar projects)
- Focuses on universal patterns (factory pattern, context, Styles API)
- Avoids hardcoded values; emphasizes configuration discovery

To adapt this skill to a similar project:

1. Update relative links in `references/` to point to your project structure
2. Verify configuration files match (tsconfig, eslint, prettier)
3. Adjust component examples if your patterns differ
4. Keep the core principles and TypeScript patterns intact

## Best Practices Enforced

- **No `any` types**: Use `unknown` or specific types
- **Explicit imports**: Named imports, proper import order
- **Ref forwarding**: All components support ref
- **Props validation**: Runtime checks when TypeScript isn't enough
- **Error messages**: Centralized in `*.errors.ts` files
- **Consistent naming**: PascalCase components, camelCase props
- **Doc comments**: JSDoc for all public props
- **Accessibility**: ARIA attributes, keyboard support

## Related Resources

External documentation (not included in skill):

- **Mantine Docs**: https://mantine.dev/llms.txt
- **React TypeScript Cheatsheet**: https://react-typescript-cheatsheet.netlify.app
- **WAI-ARIA Practices**: https://www.w3.org/WAI/ARIA/apg
- **Testing Library**: https://testing-library.com

## Maintenance

This skill should be updated when:

- Core patterns change (e.g., new factory pattern version)
- New accessibility requirements emerge
- TypeScript best practices evolve
- Project structure is reorganized

Keep the skill focused on **development** tasks. Build, test automation, and deployment remain out of scope.

## License

This skill references code and patterns from the host project. Follow the project's license for any derivative work.
