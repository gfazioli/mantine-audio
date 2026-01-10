# TypeScript Patterns Reference

TypeScript best practices and patterns specific to Mantine component development.

## Type Safety Guidelines

### Avoid `any`

❌ **Bad:**
```typescript
function handler(event: any) {
  event.preventDefault();
}
```

✅ **Good:**
```typescript
function handler(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}
```

### Use `unknown` for Unconstrained Types

❌ **Bad:**
```typescript
function process(data: any) {
  return data.value;
}
```

✅ **Good:**
```typescript
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value;
  }
  return undefined;
}
```

### React Children Types

❌ **Bad:**
```typescript
interface Props {
  children: any;
}
```

✅ **Good:**
```typescript
interface Props {
  children?: React.ReactNode; // For any renderable content
  // OR
  children: React.ReactElement; // For single element
  // OR
  children: (value: string) => React.ReactNode; // For render props
}
```

## Factory Pattern Types

Example from [`/package/src/Flip.tsx`](../../../package/src/Flip.tsx):

### Styles Names

```typescript
// Define all classNames that can be styled
export type ComponentStylesNames = 'root' | 'element' | 'subElement';
```

### CSS Variables

```typescript
// Define all CSS custom properties
export type ComponentCssVariables = {
  root: '--var-name' | '--another-var';
  element: '--element-var';
  subElement: never; // No variables for this element
};
```

### Component Props

```typescript
import { BoxProps, StylesApiProps } from '@mantine/core';

export interface ComponentBaseProps {
  /** Description of prop */
  customProp?: string;
  
  /** Callback prop */
  onChange?: (value: string) => void;
  
  /** Children (if required) */
  children: React.ReactNode;
}

export interface ComponentProps 
  extends BoxProps, 
          ComponentBaseProps, 
          StylesApiProps<ComponentFactory> {}
```

### Factory Type

```typescript
import { PolymorphicFactory } from '@mantine/core';

export type ComponentFactory = PolymorphicFactory<{
  props: ComponentProps;
  defaultComponent: 'div'; // Default HTML element
  defaultRef: HTMLDivElement; // Ref type
  stylesNames: ComponentStylesNames;
  vars: ComponentCssVariables;
  staticComponents: {
    SubComponent: typeof SubComponent;
  };
}>;
```

## Hooks Type Safety

### `useUncontrolled` Hook

```typescript
import { useUncontrolled } from '@mantine/hooks';

const [value, setValue] = useUncontrolled<string>({
  value: props.value, // Controlled value
  defaultValue: props.defaultValue, // Uncontrolled default
  finalValue: '', // Fallback
  onChange: props.onChange, // Callback
});
```

### `useStyles` Hook

```typescript
import { useStyles } from '@mantine/core';

const getStyles = useStyles<ComponentFactory>({
  name: 'ComponentName', // Must match registration
  classes, // CSS module classes
  props, // Component props
  className, // User className
  style, // User style
  classNames, // User classNames object
  styles, // User styles object
  unstyled, // Unstyled flag
  vars, // Resolved CSS variables
  varsResolver, // Vars resolver function
});
```

### Context Hooks

```typescript
import { createSafeContext } from '@mantine/core';

interface MyContext {
  value: string;
  setValue: (v: string) => void;
}

export const [MyContextProvider, useMyContext] = 
  createSafeContext<MyContext>('Error message');

// Usage in component
const ctx = useMyContext(); // Type-safe!
ctx.setValue('new value');
```

## Event Handlers

### Synthetic Events

```typescript
// Mouse events
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

// Keyboard events
onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

// Focus events
onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

// Form events
onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
```

### createEventHandler

```typescript
import { createEventHandler } from '@mantine/core';

// Compose multiple event handlers
const onClick = createEventHandler(
  childProps.onClick, // Preserve child's handler
  () => doSomething() // Add parent's handler
);
```

## Utility Types

### Extract Props from Element

```typescript
type ButtonProps = React.ComponentPropsWithoutRef<'button'>;
type DivProps = React.ComponentPropsWithoutRef<'div'>;
```

### Polymorphic Components

```typescript
import { PolymorphicComponentProps } from '@mantine/core';

// Component that can render as any element
type MyComponentProps<C = 'div'> = PolymorphicComponentProps<C, {
  customProp: string;
}>;

// Usage
<MyComponent component="button" onClick={...} /> // button props
<MyComponent component="a" href="..." /> // anchor props
```

## Type Guards

### Element Validation

```typescript
import { isElement } from '@mantine/core';

if (!isElement(children)) {
  throw new Error('Children must be a valid React element');
}
```

### Custom Type Guards

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}
```

## Generic Constraints

### Constrained Generics

```typescript
// Constrain to React components
function wrapComponent<T extends React.ComponentType<any>>(
  Component: T
): T {
  return Component;
}

// Constrain to object with specific shape
function mergeProps<T extends Record<string, any>>(
  defaults: T,
  overrides: Partial<T>
): T {
  return { ...defaults, ...overrides };
}
```

## Discriminated Unions

For variant props:

```typescript
type ButtonVariant =
  | { variant: 'primary'; color: string }
  | { variant: 'secondary'; outlined: boolean }
  | { variant: 'link'; href: string };

function Button(props: ButtonVariant) {
  if (props.variant === 'primary') {
    // TypeScript knows props.color exists here
    return <button style={{ color: props.color }} />;
  }
  if (props.variant === 'link') {
    // TypeScript knows props.href exists here
    return <a href={props.href} />;
  }
  // ...
}
```

## Declaration Files

### Module Augmentation

For CSS modules (handled by build, but for reference):

```typescript
// @types/overrides.d.ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

### Type-only Imports

```typescript
// Import only types (not runtime code)
import type { ComponentProps } from './Component';
import type { StylesApiData } from '../types';

// Export type-only
export type { ComponentProps, ComponentFactory };
```

## Type Inference

### Infer from Props

```typescript
const defaultProps = {
  variant: 'primary' as const,
  size: 'md' as const,
};

// Infer literal types
type Variant = typeof defaultProps.variant; // 'primary'
type Size = typeof defaultProps.size; // 'md'
```

### Infer from Factory

```typescript
import type { GetStylesApi } from '@mantine/core';

// Extract types from factory
type ComponentStylesApi = GetStylesApi<ComponentFactory>;
```

## Common Patterns

### Optional Callback Props

```typescript
interface Props {
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

// Call with optional chaining
props.onChange?.(newValue);
```

### Readonly Arrays

```typescript
interface Props {
  items: ReadonlyArray<string>; // Or readonly string[]
}

// Prevents accidental mutation
props.items.push('new'); // ❌ Error
```

### Exact Types (No Extra Props)

TypeScript doesn't enforce this by default, but validate at runtime:

```typescript
const allowedProps = ['variant', 'size', 'color'] as const;

function validateProps<T extends Record<string, any>>(props: T) {
  Object.keys(props).forEach(key => {
    if (!allowedProps.includes(key as any)) {
      console.warn(`Unknown prop: ${key}`);
    }
  });
}
```

## Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **React TypeScript Cheatsheet**: https://react-typescript-cheatsheet.netlify.app/
- **Mantine Types**: https://mantine.dev/guides/typescript/
